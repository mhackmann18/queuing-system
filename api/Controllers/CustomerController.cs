using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using CustomerApi.Models;
using CustomerApi.Services;
using CustomerApi.Utilities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CustomerApi.Controllers;

[Route("api/v1/")]
[ApiController]
public partial class CustomerController : ControllerBase
{
    private readonly CustomerContext _context;
    private readonly IHubContext<SignalrHub> _hubContext;
    private readonly ILogger<CustomerController> _logger;
    private readonly IConfiguration _config;

    public CustomerController(
        CustomerContext context,
        IHubContext<SignalrHub> hubContext,
        ILogger<CustomerController> logger,
        IConfiguration config
    )
    {
        _context = context;
        _logger = logger;
        _hubContext = hubContext;
        _config = config;
    }

    [Authorize]
    [HttpGet("customers")]
    public async Task<ActionResult<List<CustomerDto>>> GetCustomers()
    {
        List<CustomerDto> customers = await _context
            .Customer.Select(c => new CustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                CheckInTime = c.CheckInTime,
                Divisions = c
                    .Divisions.Select(d => new CustomerDivisionDto
                    {
                        Name = d.DivisionName,
                        Status = d.Status,
                        WaitingListIndex = d.WaitingListIndex,
                        TimesCalled = d.TimesCalled.Select(t => t.TimeCalled).ToList()
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(customers);
    }

    public class PatchCustomerBody
    {
        public List<PatchCustomerBodyDivision>? Divisions { get; set; }

        public class PatchCustomerBodyDivision
        {
            public required string Name { get; set; }
            public string? Status { get; set; }
            public int? WaitingListIndex { get; set; }
            public List<DateTime>? TimesCalled { get; set; }
        };
    };

    private async Task<List<CustomerDivision>> GetDivisionWaitingList(
        Guid officeId,
        string divisionName
    )
    {
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return new List<CustomerDivision>();
        }

        List<CustomerDivision> waitingCustomers = await _context
            .CustomerDivision.Include(cd => cd.Customer)
            .Where(cd =>
                cd.DivisionOfficeId == officeId
                && cd.DivisionName == divisionName
                && cd.Status == "Waiting"
                && cd.WaitingListIndex != null
            )
            .ToListAsync();

        List<CustomerDivision> todaysWaitingCustomers = waitingCustomers
            .Where(cd =>
                DateUtils.SameDay(cd.Customer.CheckInTime, DateTime.UtcNow, office.Timezone)
            )
            .OrderBy(cd => cd.WaitingListIndex)
            .ToList();

        return todaysWaitingCustomers;
    }

    /******************/
    /* PATCH CUSTOMER */
    /******************/

    /* Helper method for PatchCustomer. Does not save changes to the database. Returns HTTP
    response if there is an error, otherwise returns null. */
    private async Task<ActionResult?> RemoveCustomerDivisionWaitingListIndex(
        CustomerDivision customerDivision
    )
    {
        // Check that the customer division has a waitingListIndex to remove
        int? wlIndex = customerDivision.WaitingListIndex;
        if (wlIndex == null)
        {
            return BadRequest("Customer division does not have a waitingListIndex");
        }

        // Select all customers in the waiting list for this division
        List<CustomerDivision> cdsToUpdate = (await GetDivisionWaitingList(
            customerDivision.DivisionOfficeId,
            customerDivision.DivisionName
        )).Where(cd => cd.WaitingListIndex > wlIndex)
            .ToList();

        // Move selected customers up one position in waiting list queue
        foreach (CustomerDivision cdToUpdate in cdsToUpdate)
        {
            cdToUpdate.WaitingListIndex--;
        }

        // Clear this customers WL index
        customerDivision.WaitingListIndex = null;

        return null;
    }

    /* Helper method for PatchCustomer. Does not save changes to the database. Returns HTTP
    response if there is an error, otherwise returns null. */
    private async Task<ActionResult?> UpdateCustomerDivisionStatus(
        CustomerDivision customerDivisionToUpdate,
        string newStatus
    )
    {
        Guid customerId = customerDivisionToUpdate.CustomerId;
        Guid officeId = customerDivisionToUpdate.DivisionOfficeId;
        string divisionName = customerDivisionToUpdate.DivisionName;
        string oldStatus = customerDivisionToUpdate.Status;

        // TODO: Validate 'Desk' statuses

        if (oldStatus == "Waiting" && DeskRegex().IsMatch(newStatus))
        {
            // If a customer's status is transitioning from 'Waiting' to 'Desk X', the current time should be added to their timesCalled
            CustomerDivisionTimeCalled cdtc =
                new()
                {
                    TimeCalled = DateTime.UtcNow,
                    CustomerDivisionCustomerId = customerId,
                    CustomerDivisionDivisionName = divisionName,
                    CustomerDivisionDivisionOfficeId = officeId
                };
            await _context.CustomerDivisionTimeCalled.AddAsync(cdtc);

            // Add customer to desk
            CustomerAtDesk cad =
                new()
                {
                    CustomerId = customerId,
                    DeskDivisionOfficeId = officeId,
                    DeskDivisionName = divisionName,
                    DeskNumber = int.Parse(newStatus.Split(" ")[1])
                };
            await _context.CustomerAtDesk.AddAsync(cad);
        }

        // If a customer is transitioning from 'Waiting' to any other status, their waitingListIndex should be null
        if (oldStatus == "Waiting" && newStatus != "Waiting")
        {
            var res = await RemoveCustomerDivisionWaitingListIndex(customerDivisionToUpdate);
            if (res != null)
            {
                return res;
            }
        }

        // If customer is transitioning from 'Desk X' to any other status, remove them from the desk. TODO: Add support for switching desks
        if (DeskRegex().IsMatch(oldStatus) && newStatus != oldStatus)
        {
            CustomerAtDesk? cad = await _context
                .CustomerAtDesk.Where(cad => cad.CustomerId == customerId)
                .FirstOrDefaultAsync();

            if (cad != null)
            {
                _context.CustomerAtDesk.Remove(cad);
            }
        }

        customerDivisionToUpdate.Status = newStatus;

        return null;
    }

    /* Helper method for PatchCustomer. Does not save changes to the database. Returns HTTP
    response if there is an error, otherwise returns null. */
    private async Task<ActionResult?> UpdateCustomerDivisionWaitingListIndex(
        CustomerDivision customerDivision,
        int newWaitingListIndex
    )
    {
        Guid officeId = customerDivision.DivisionOfficeId;
        string divisionName = customerDivision.DivisionName;
        int? oldWaitingListIndex = customerDivision.WaitingListIndex;

        // Check that waiting list index is valid
        if (newWaitingListIndex < 1)
        {
            return BadRequest($"'waitingListIndex' property must be a positive non-zero integer.");
        }

        // This is the maximum legal value for the new waiting list index
        int maxPossibleIndex = await GetMaxWLIndexFromDivision(officeId, divisionName);

        /* If this customer didn't already have a waiting list index, the maximum index increases by
           1 because the customer is being inserted into the waiting list. If the maxPossibleIndex
           is 0 (no customers in wl) the maxPossibleIndex should be 1 */
        if (oldWaitingListIndex == null || maxPossibleIndex == 0)
        {
            maxPossibleIndex++;
        }

        // Check that the waitingListIndex property is within bounds
        if (newWaitingListIndex > maxPossibleIndex)
        {
            return BadRequest(
                $"The 'waitingListIndex' prop of division '{divisionName}' is out of bounds. The maximum allowed value is {maxPossibleIndex}."
            );
        }

        // Get the waiting list for this customer's division
        List<CustomerDivision> waitingList = await GetDivisionWaitingList(officeId, divisionName);

        // The if statements update the waiting list indexes for other customers in waiting list
        if (oldWaitingListIndex == null)
        {
            List<CustomerDivision> cdsToUpdate = waitingList
                .Where(cd => cd.WaitingListIndex >= newWaitingListIndex)
                .ToList();

            foreach (CustomerDivision cdToUpdate in cdsToUpdate)
            {
                cdToUpdate.WaitingListIndex++;
            }
        }
        else if (newWaitingListIndex < oldWaitingListIndex)
        {
            List<CustomerDivision> cdsToUpdate = waitingList
                .Where(cd =>
                    cd.WaitingListIndex < oldWaitingListIndex
                    && cd.WaitingListIndex >= newWaitingListIndex
                )
                .ToList();

            foreach (CustomerDivision cdToUpdate in cdsToUpdate)
            {
                cdToUpdate.WaitingListIndex++;
            }
        }
        else if (newWaitingListIndex > oldWaitingListIndex)
        {
            List<CustomerDivision> cdsToUpdate = waitingList
                .Where(oldCustomerDivision =>
                    oldCustomerDivision.WaitingListIndex <= newWaitingListIndex
                    && oldCustomerDivision.WaitingListIndex > oldWaitingListIndex
                )
                .ToList();

            foreach (CustomerDivision cdToUpdate in cdsToUpdate)
            {
                cdToUpdate.WaitingListIndex--;
            }
        }

        // Update this customer's waiting list index
        customerDivision.WaitingListIndex = newWaitingListIndex;

        return null;
    }

    /* Helper method for PatchCustomer. Does not save changes to the database. Returns HTTP
    response if there is an error, otherwise returns null. */
    private async Task<ActionResult?> UpdateCustomerDivision(
        Guid officeId,
        Guid customerId,
        PatchCustomerBody.PatchCustomerBodyDivision cdNewProps
    )
    {
        // Without division name, there would be no way to know which customer division to update
        if (cdNewProps.Name == null)
        {
            return BadRequest("Must provide a 'name' property for each division");
        }

        // Check that the customer is a member of the division
        CustomerDivision? cdToUpdate = await _context.CustomerDivision.FindAsync(
            customerId,
            cdNewProps.Name,
            officeId
        );
        if (cdToUpdate == null)
        {
            return BadRequest(
                $"This customer does not belong to any division with the name '{cdNewProps.Name}'"
            );
        }

        // Update division status
        if (cdNewProps.Status != null)
        {
            /* Require the 'waitingListIndex' property if the customer's status is being updated to 'Waiting' */
            if (cdNewProps.Status == "Waiting" && cdNewProps.WaitingListIndex == null)
            {
                return BadRequest(
                    "Customers whose status is being updated to 'Waiting' must have a 'waitingListIndex' property"
                );
            }

            var response = await UpdateCustomerDivisionStatus(cdToUpdate, cdNewProps.Status);
            if (response != null)
            {
                return response;
            }
        }

        // Update waiting list index
        if (cdNewProps.WaitingListIndex != null)
        {
            /* Require the customer's status to be 'Waiting' if the 'waitingListIndex' property is
            being updated */
            if (cdNewProps.Status != "Waiting")
            {
                return BadRequest(
                    "The 'waitingListIndex' property can only be updated for customers whose status is 'Waiting'."
                );
            }

            var response = await UpdateCustomerDivisionWaitingListIndex(
                cdToUpdate,
                (int)cdNewProps.WaitingListIndex
            );
            if (response != null)
            {
                return response;
            }
        }

        return null;
    }

    [Authorize(Policy = "AtDesk")]
    [HttpPatch("offices/{officeId}/customers/{customerId}")]
    public async Task<ActionResult<CustomerDto>> PatchCustomer(
        Guid officeId,
        Guid customerId,
        [FromBody] PatchCustomerBody cdsToUpdate
    )
    {
        // Check that customer exists
        Customer? customer = await _context.Customer.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound($"No customer found with id {customerId}");
        }

        if (cdsToUpdate.Divisions != null)
        {
            // Error handling for empty divisions array
            if (cdsToUpdate.Divisions.Count == 0)
            {
                return BadRequest("Must provide at least one division");
            }

            // Update each of the customer's divisions
            foreach (
                PatchCustomerBody.PatchCustomerBodyDivision cdUpdatedProps in cdsToUpdate.Divisions
            )
            {
                var response = await UpdateCustomerDivision(officeId, customerId, cdUpdatedProps);
                if (response != null)
                {
                    return response;
                }
            }
        }
        else // TODO: If other customer properties are allowed to be updated, the 'Divisions' property should not be required
        {
            return BadRequest("Must provide a 'Divisions' property");
        }

        // Save changes to the database
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving changes to the database.");
            return StatusCode(500, "Error saving changes to the database.");
        }

        // Notify all clients that the customers have been updated
        try
        {
            await _hubContext.Clients.All.SendAsync("customersUpdated");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SignalR message.");
            return StatusCode(500, "Error sending SignalR message.");
        }

        // Return the updated customer
        return await GetCustomer(customerId);
    }

    /*****************/
    /* GET CUSTOMERS */
    /*****************/

    [Authorize]
    [HttpPost("offices/{officeId}/customers/query")]
    public async Task<ActionResult<List<CustomerDto>>> GetCustomersWithFilters(
        Guid officeId,
        [FromBody] CustomersQueryBody filters
    )
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest("Invalid officeId provided");
        }

        // Check that division filters are valid
        if (filters.Divisions != null)
        {
            foreach (CustomersQueryBody.CustomersQueryBodyDivision division in filters.Divisions)
            {
                // Check that each division has a name prop
                if (division.Name == null)
                {
                    return BadRequest("Must provide a 'name' property for each division");
                }
                else
                {
                    // Check that office has a division with the provided name
                    var divisionFound = await _context
                        .Office.Where(o =>
                            o.Id == officeId
                            && o.Divisions != null
                            && o.Divisions.Any(d => d.Name == division.Name)
                        )
                        .Include(o => o.Divisions)
                        .FirstOrDefaultAsync();

                    // Return error if division doesn't exist
                    if (divisionFound == null)
                    {
                        return BadRequest($"Office has no division '{division.Name}'");
                    }
                }
                // Check that the provided statuses are valid
                if (division.Statuses != null)
                {
                    // TODO: Validate each status
                }
            }
        }

        // Check that request body has at least one required property
        if (filters.Divisions == null && filters.Dates == null)
        {
            return BadRequest(
                "Must provide at least one filter property. Available filter properties: 'Divisions', 'Dates'"
            );
        }

        // Initialize an empty list to hold the customers
        List<Customer> filteredCustomers = new List<Customer>();

        // Filter by divisions ...
        if (filters.Divisions != null)
        {
            foreach (var filter in filters.Divisions)
            {
                var customersWithCurrentFilter = await _context
                    .Customer.Where(c =>
                        c.Divisions.Any(d =>
                            d.DivisionOfficeId == officeId
                            && d.DivisionName == filter.Name
                            && (filter.Statuses == null || filter.Statuses.Contains(d.Status))
                        )
                    )
                    .Include(c => c.Divisions)
                    .ThenInclude(d => d.TimesCalled)
                    .ToListAsync();

                filteredCustomers.AddRange(customersWithCurrentFilter);
            }

            if (filteredCustomers.Count == 0)
            {
                return Ok(new List<CustomerDto>());
            }
        }

        // Filter by dates
        if (filters.Dates != null)
        {
            if (filteredCustomers.Count == 0)
            {
                foreach (var dateFilter in filters.Dates)
                {
                    var customersWithCurrentFilter = await _context
                        .Customer.Where(c =>
                            DateUtils.SameDay(dateFilter, c.CheckInTime, office.Timezone)
                            && c.Divisions.Any(d => d.DivisionOfficeId == officeId)
                        )
                        .Include(c => c.Divisions)
                        .ThenInclude(d => d.TimesCalled)
                        .ToListAsync();

                    filteredCustomers.AddRange(customersWithCurrentFilter);
                }
            }
            else
            {
                foreach (DateTime dateFilter in filters.Dates)
                {
                    filteredCustomers = filteredCustomers
                        .Where(c => DateUtils.SameDay(dateFilter, c.CheckInTime, office.Timezone))
                        .ToList();
                }
            }

            if (filteredCustomers.Count == 0)
            {
                return Ok(new List<CustomerDto>());
            }
        }

        // Sanitize customers
        var customers = filteredCustomers
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                CheckInTime = c.CheckInTime,
                Divisions = c
                    .Divisions.Select(d => new CustomerDivisionDto
                    {
                        Name = d.DivisionName,
                        Status = d.Status,
                        WaitingListIndex = d.WaitingListIndex,
                        TimesCalled = d.TimesCalled.Select(t => t.TimeCalled).ToList()
                    })
                    .ToList()
            })
            .OrderBy(c => c.CheckInTime)
            .ToList();

        return Ok(customers);
    }

    [Authorize]
    [HttpGet("customers/{customerId}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(Guid customerId)
    {
        var customer = await _context
            .Customer.Where(c => c.Id == customerId)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                CheckInTime = c.CheckInTime,
                Divisions = c
                    .Divisions.Select(d => new CustomerDivisionDto
                    {
                        Name = d.DivisionName,
                        Status = d.Status,
                        WaitingListIndex = d.WaitingListIndex,
                        TimesCalled = d.TimesCalled.Select(t => t.TimeCalled).ToList()
                    })
                    .ToList()
            })
            .ToListAsync();

        if (customer.Count == 0)
        {
            return NotFound($"No customer found with id {customerId}");
        }

        return Ok(customer[0]);
    }

    private async Task<int> GetMaxWLIndexFromDivision(Guid officeId, string divisionName)
    {
        // Check that office exists
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return -1;
        }

        List<CustomerDivision> customerDivisions = await GetDivisionWaitingList(
            officeId,
            divisionName
        );
        // var customerDivisions = await _context
        //     .CustomerDivision.Include(cd => cd.Customer)
        //     .Where(cd =>
        //         cd.DivisionOfficeId == officeId
        //         && cd.DivisionName == divisionName
        //         && cd.WaitingListIndex != null
        //     )
        //     .ToListAsync(); // Load data into memory

        int? maxWLIndex = customerDivisions.Max(cd => cd.WaitingListIndex);

        // If no customers are in WL, the maximum possible index is 1 (WL is 1-based, not 0-based)
        maxWLIndex ??= 0;

        return (int)maxWLIndex;
    }

    [Authorize]
    [HttpPost("offices/{officeId}/customers")]
    public async Task<ActionResult<CustomerDto>> PostCustomerToOffice(
        Guid officeId,
        [FromBody] CustomerPostedInOffice postedCustomer
    )
    {
        Guid customerId = Guid.NewGuid();
        DateTime checkInTime = DateTime.UtcNow;

        // Check for errors in request body
        if (postedCustomer.divisionNames.Length == 0)
        {
            return BadRequest("Please include at least one division");
        }

        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest("Invalid officeId provided");
        }

        // Insert into Customer
        Customer customer = new Customer
        {
            Id = customerId,
            FullName = postedCustomer.fullName,
            CheckInTime = checkInTime
        };
        await _context.Customer.AddAsync(customer);

        // Insert divisions into CustomerDivision
        foreach (string divisionName in postedCustomer.divisionNames)
        {
            // Find divisions with the given name and officeId
            Division? division = await _context.Division.FindAsync(divisionName, officeId);

            // If no divisions are found, return an error
            if (division == null)
            {
                return BadRequest($"Invalid division '{divisionName}' provided");
            }
            else
            {
                int maxWLIndex = await GetMaxWLIndexFromDivision(officeId, divisionName);

                // Insert into CustomerDivision
                CustomerDivision cd = new CustomerDivision
                {
                    CustomerId = customerId,
                    DivisionName = divisionName,
                    Status = "Waiting",
                    DivisionOfficeId = officeId,
                    WaitingListIndex = maxWLIndex + 1
                };

                await _context.CustomerDivision.AddAsync(cd);
            }
        }

        // TODO: Fix this shit

        await _context.SaveChangesAsync();
        // DateTime today = DateTime.UtcNow;
        // ActionResult<Response> res = await GetCustomersWithFilters(
        //     officeId,
        //     new CustomersQueryBody{ Dates = new List<DateTime> { today } }
        // );

        // Check if the result is a success
        // if (res.Result is OkObjectResult okObjectResult)
        // {
        //     Response response = okObjectResult.Value as Response;

        //     List<CustomerDto> c = response.Data;
        await _hubContext.Clients.All.SendAsync("customersUpdated");
        return await GetCustomer(customerId);
        // } else {
        //     return res;
        // }
    }

    [Authorize(Policy = "AtDesk")]
    [HttpDelete("offices/{officeId}/customers/{customerId}")]
    public async Task<ActionResult<CustomerDto>> DeleteCustomer(Guid officeId, Guid customerId)
    {
        Customer? customer = await _context.Customer.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound($"No customer found with id {customerId}");
        }

        List<CustomerDivision> cds = await _context
            .CustomerDivision.Where(cd => cd.CustomerId == customerId)
            .ToListAsync();

        if (cds.Count != 0)
        {
            foreach (CustomerDivision cd in cds)
            {
                // Update waitingListIndexes for division
                if (cd.Status == "Waiting" && cd.WaitingListIndex != null)
                {
                    int wlIndex = (int)cd.WaitingListIndex;

                    List<CustomerDivision> cdsToUpdate = (
                        await GetDivisionWaitingList(officeId, cd.DivisionName)
                    )
                        .Where(cdToUpdate =>
                            cdToUpdate.CustomerId != customerId
                            && cdToUpdate.WaitingListIndex > wlIndex
                        )
                        .ToList();

                    foreach (CustomerDivision cdToUpdate in cdsToUpdate)
                    {
                        cdToUpdate.WaitingListIndex--;
                    }
                }
            }
        }

        List<CustomerDto> customerToDelete = await _context
            .Customer.Where(c => c.Id == customerId)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                CheckInTime = c.CheckInTime,
                Divisions = c
                    .Divisions.Select(d => new CustomerDivisionDto
                    {
                        Name = d.DivisionName,
                        Status = d.Status,
                        WaitingListIndex = d.WaitingListIndex,
                        TimesCalled = d.TimesCalled.Select(t => t.TimeCalled).ToList()
                    })
                    .ToList()
            })
            .ToListAsync();

        _context.Customer.Remove(customer);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("customersUpdated");

        return Ok(customerToDelete[0]);
    }

    [GeneratedRegex(@"^Desk\s\d+$")]
    private static partial Regex DeskRegex();

    [Authorize]
    [HttpGet("offices/{officeId}/divisions")]
    public async Task<ActionResult<DivisionDto>> GetDivisionsInOffice(Guid officeId)
    {
        var divisions = await _context
            .Division.Where(d => d.OfficeId == officeId)
            .Include(d => d.Desks)
            .ThenInclude(d => d.UserAtDesk)
            .Select(d => new DivisionDto
            {
                Name = d.Name,
                NumberOfDesks = d.MaxNumberOfDesks,
                OccupiedDeskNumbers =
                    d.Desks == null
                        ? new List<int>()
                        : d
                            .Desks.Where(d => d.UserAtDesk != null)
                            .Select(desk =>
                                desk.UserAtDesk == null ? 0 : desk.UserAtDesk.DeskNumber
                            )
                            .ToList()
            })
            .ToListAsync();

        return Ok(divisions);
    }

    // Remove user from desk
    [Authorize(Policy = "AtDesk")]
    [HttpDelete("offices/{officeId}/users/{userId}/desk")]
    public async Task<ActionResult<UserDto>> RemoveUserFromDesk(Guid officeId, Guid userId)
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest("Invalid officeId provided");
        }

        // Check that userId is valid
        User? user = await _context.User.FindAsync(userId);
        if (user == null)
        {
            return BadRequest("Invalid userId provided");
        }

        // Check that the user is a member of the office
        UserOffice? userOffice = await _context.UserOffice.FindAsync(userId, officeId);
        if (userOffice == null)
        {
            return BadRequest("User is not a member of the office");
        }

        // Check that the user is at a desk
        UserAtDesk? atDesk = await _context
            .UserAtDesk.Where(at => at.UserId == userId)
            .FirstOrDefaultAsync();
        if (atDesk == null)
        {
            return BadRequest("User is not at a desk");
        }

        // Check if there's a customer at the desk
        CustomerAtDesk? customerAtDesk = await _context
            .CustomerAtDesk.Where(cad =>
                cad.DeskDivisionOfficeId == atDesk.DeskDivisionOfficeId
                && cad.DeskNumber == atDesk.DeskNumber
                && cad.DeskDivisionName == atDesk.DeskDivisionName
            )
            .FirstOrDefaultAsync();

        // Remove customer from desk and return customer to waiting list
        if (customerAtDesk != null)
        {
            // Remove customer from desk
            _context.CustomerAtDesk.Remove(customerAtDesk);

            // Move all customers in the waiting list up one position
            List<CustomerDivision> fd = await GetDivisionWaitingList(
                atDesk.DeskDivisionOfficeId,
                atDesk.DeskDivisionName
            );

            foreach (CustomerDivision cd in fd)
            {
                cd.WaitingListIndex++;
            }

            // Place this customer at the front of the waiting list
            CustomerDivision? thisCustomersDivision = await _context
                .CustomerDivision.Where(cd =>
                    cd.CustomerId == customerAtDesk.CustomerId
                    && cd.DivisionOfficeId == atDesk.DeskDivisionOfficeId
                    && cd.DivisionName == atDesk.DeskDivisionName
                )
                .FirstOrDefaultAsync();

            if (thisCustomersDivision != null)
            {
                thisCustomersDivision.Status = "Waiting";
                thisCustomersDivision.WaitingListIndex = 1;
            }
            else
            {
                return BadRequest("Customer's division not found");
            }
        }

        // Remove user from desk
        _context.UserAtDesk.Remove(atDesk);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("desksUpdated");

        return Ok(atDesk);
    }

    [Authorize]
    [HttpPost("offices/{officeId}/users/{userId}/desk")]
    public async Task<ActionResult<DeskDto>> PostUserToDesk(
        Guid officeId,
        Guid userId,
        [FromBody] PostedDesk postedDesk
    )
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest("Invalid officeId provided");
        }

        // Check that userId is valid
        User? user = await _context.User.FindAsync(userId);
        if (user == null)
        {
            return BadRequest("Invalid userId provided");
        }

        // Check that the user is a member of the office
        UserOffice? userOffice = await _context.UserOffice.FindAsync(userId, officeId);
        if (userOffice == null)
        {
            return BadRequest("User is not a member of the office");
        }

        // Check that the user is not already at a desk
        UserAtDesk? atDesk = await _context
            .UserAtDesk.Where(at => at.UserId == userId)
            .FirstOrDefaultAsync();
        if (atDesk != null)
        {
            return BadRequest("User is already at a desk");
        }

        // Check that the division name is valid
        Division? division = await _context.Division.FindAsync(postedDesk.DivisionName, officeId);
        if (division == null)
        {
            return BadRequest("Invalid division name provided");
        }

        // Check that the desk number is valid
        if (postedDesk.Number < 1 || postedDesk.Number > division.MaxNumberOfDesks)
        {
            return BadRequest("Invalid desk number provided");
        }

        // Check that the desk is not already occupied
        UserAtDesk? deskOccupied = await _context.UserAtDesk.FindAsync(
            user.Id,
            postedDesk.Number,
            postedDesk.DivisionName,
            officeId
        );
        if (deskOccupied != null)
        {
            return BadRequest("Desk is already occupied");
        }

        // Insert into UserAtDesk
        UserAtDesk newUserAtDesk = new UserAtDesk
        {
            UserId = userId,
            DeskDivisionOfficeId = officeId,
            DeskDivisionName = postedDesk.DivisionName,
            DeskNumber = postedDesk.Number,
            SessionEndTime = DateTime.UtcNow.AddMinutes(15)
        };
        await _context.UserAtDesk.AddAsync(newUserAtDesk);

        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("desksUpdated");

        return Ok(
            new
            {
                DivisionName = newUserAtDesk.DeskDivisionName,
                Number = newUserAtDesk.DeskNumber,
                newUserAtDesk.SessionEndTime
            }
        );
    }

    // Extend user's session at desk
    [Authorize(Policy = "AtDesk")]
    [HttpPost("offices/{officeId}/users/{userId}/desk/extend-session")]
    public async Task<ActionResult<DeskDto>> ExtendUserSessionAtDesk(Guid officeId, Guid userId)
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest("Invalid officeId provided");
        }

        // Check that userId is valid
        User? user = await _context.User.FindAsync(userId);
        if (user == null)
        {
            return BadRequest("Invalid userId provided");
        }

        // Check that the user is a member of the office
        UserOffice? userOffice = await _context.UserOffice.FindAsync(userId, officeId);
        if (userOffice == null)
        {
            return BadRequest("User is not a member of the office");
        }

        // Check that the user is at a desk
        UserAtDesk? atDesk = await _context
            .UserAtDesk.Where(at => at.UserId == userId)
            .FirstOrDefaultAsync();
        if (atDesk == null)
        {
            return BadRequest("User is not at a desk");
        }

        // Extend the user's session
        atDesk.SessionEndTime = DateTime.UtcNow.AddMinutes(15);
        await _context.SaveChangesAsync();

        return Ok(
            new
            {
                atDesk.DeskDivisionName,
                atDesk.DeskNumber,
                atDesk.SessionEndTime
            }
        );
    }

    [HttpPost("users")]
    public async Task<ActionResult<User>> AddUser([FromBody] PostUserBody user)
    {
        // if (user.Password == null)
        // {
        //     return BadRequest();
        // }
        // if (user.Username == null)
        // {
        //     return BadRequest();
        // }
        // if (user.FirstName == null)
        // {
        //     return BadRequest();
        // }
        // if (user.LastName == null)
        // {
        //     return BadRequest("");
        // }
        if (user.Username.Length < 8)
        {
            return BadRequest("Username must be at least 8 characters long");
        }
        if (user.Password.Length < 8)
        {
            return BadRequest("Password must be at least 8 characters long");
        }

        List<User> existingUser = await _context
            .User.Where(u => u.Username == user.Username)
            .ToListAsync();
        if (existingUser.Count >= 1)
        {
            return BadRequest("Username already exists");
        }

        // Generate a potential Guid for the user
        Guid potentialUserId = Guid.NewGuid();

        foreach (Guid officeId in user.OfficeIds)
        {
            // Check if there is an office with specific ID
            Office? existingOffice = await _context.Office.FindAsync(officeId);

            if (existingOffice == null)
            {
                // If the office doesn't exist, bad request
                return BadRequest($"No office found with id {officeId}");
            }

            // Create new userOffice entry
            UserOffice userOffice = new UserOffice
            {
                UserId = potentialUserId,
                OfficeId = officeId
            };

            // Add userOffice entry to context
            await _context.UserOffice.AddAsync(userOffice);
        }

        // Encrypt password before storing on server
        string passwordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(user.Password, 13);

        // Console.WriteLine(passwordHash);
        // Console.WriteLine(BCrypt.Net.BCrypt.EnhancedVerify(user.Password, passwordHash));


        // Create user model
        User newUser =
            new()
            {
                Id = potentialUserId,
                Username = user.Username,
                PasswordHash = passwordHash,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

        await _context.User.AddAsync(newUser);

        await _context.SaveChangesAsync();

        // Return created user to client
        return Ok(
            new
            {
                Id = newUser.Id,
                newUser.Username,
                newUser.FirstName,
                newUser.LastName
            }
        );
    }

    [Authorize]
    [HttpGet("offices/{officeId}")]
    public async Task<ActionResult<OfficeDto>> GetOffice(Guid officeId)
    {
        Office? office = await _context
            .Office.Include(o => o.Divisions)
            .FirstOrDefaultAsync(o => officeId == o.Id);

        if (office == null)
        {
            return NotFound($"No office found with id {officeId}");
        }

        if (office.Divisions == null)
        {
            return BadRequest("No divisions found for this office");
        }

        return new OfficeDto
        {
            Id = office.Id,
            Name = office.Name,
            DivisionNames = office.Divisions.Select(d => d.Name).ToList()
        };
    }

    [HttpPost("users/login")]
    public async Task<ActionResult<User>> LoginUser([FromBody] LoginUserBody user)
    {
        // Check if there is a user with the specific username
        User? existingUser = await _context
            .User.Where(u => u.Username == user.Username)
            .FirstOrDefaultAsync(u => u.Username == user.Username);

        if (existingUser == null)
        {
            return BadRequest("Username not found");
        }

        // Check if the password is correct
        if (user.Password != null)
        {
            if (!BCrypt.Net.BCrypt.EnhancedVerify(user.Password, existingUser.PasswordHash))
            {
                return BadRequest("Incorrect password");
            }
        }
        else
        {
            return BadRequest("Password cannot be null");
        }

        // JWT token generation starts here
        var jwtKey = _config["Jwt:Key"];
        if (jwtKey == null)
        {
            return BadRequest("JWT key not found");
        }

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // Create a claim for the username
        var claims = new[]
        {
            // new Claim(ClaimTypes.Name, existingUser.Username),
            new Claim(ClaimTypes.NameIdentifier, existingUser.Id.ToString())
        };

        var Sectoken = new JwtSecurityToken(
            _config["Jwt:Issuer"],
            _config["Jwt:Issuer"],
            claims,
            expires: DateTime.UtcNow.AddHours(9), // Expires in 9 hours
            signingCredentials: credentials
        );

        var token = new JwtSecurityTokenHandler().WriteToken(Sectoken);
        // JWT token generation ends here

        return Ok(
            new
            {
                Id = existingUser.Id,
                existingUser.Username,
                existingUser.FirstName,
                existingUser.LastName,
                Token = token
            }
        );
    }

    [HttpGet("users/self")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        Claim? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized("Token does not contain a userId claim");
        }

        // Get the username from the User property
        string userId = userIdClaim.Value;

        // If the username claim is not included in the JWT, return an error
        if (userId == null)
        {
            return Unauthorized("Token does not contain a username claim");
        }

        Guid parsedId = Guid.Parse(userId);

        // Fetch the user data from the database
        User? user = await _context
            .User.Include(u => u.Desk)
            .FirstOrDefaultAsync(u => u.Id == parsedId);

        // If the user does not exist in the database, return an error
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Return the user data
        return Ok(
            new
            {
                user.Id,
                user.Username,
                user.FirstName,
                user.LastName,
                Desk = user.Desk == null
                    ? null
                    : new
                    {
                        DivisionName = user.Desk.DeskDivisionName,
                        Number = user.Desk.DeskNumber,
                        user.Desk.SessionEndTime
                    }
            }
        );
    }
}

public class LoginUserBody
{
    public required string Username { get; init; }
    public required string Password { get; init; }
}

public class PostedCustomer
{
    public required string fullName { get; set; }
    public required Guid officeId { get; set; }
    public required string[] divisions { get; set; }
};

public class PostedDesk
{
    public required string DivisionName { get; init; }
    public required int Number { get; init; }
}

public class CustomerPostedInOffice
{
    public required string fullName { get; init; }
    public required string[] divisionNames { get; init; }
}

public class CustomersQueryBody
{
    public List<CustomersQueryBodyDivision>? Divisions { get; set; }
    public List<DateTime>? Dates { get; set; }

    public class CustomersQueryBodyDivision
    {
        public required string Name { get; init; }
        public string[]? Statuses { get; init; }
    }
}

public class PostUserBody
{
    public required string Username { get; init; }
    public required string Password { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }

    public required List<Guid> OfficeIds { get; init; }
}
