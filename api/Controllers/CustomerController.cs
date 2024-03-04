using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using CustomerApi.Models;
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
    public async Task<ActionResult<Response>> GetCustomers()
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

        return Ok(new Response { Data = customers });
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

    /******************/
    /* PATCH CUSTOMER */
    /******************/

    /* Helper method for PatchCustomer. Does not save changes to the database. Returns HTTP 
    response if there is an error, otherwise returns null. */
    private ActionResult<Response>? RemoveCustomerDivisionWaitingListIndex(
        CustomerDivision customerDivision
    )
    {
        // Check that the customer division has a waitingListIndex to remove
        int? wlIndex = customerDivision.WaitingListIndex;
        if (wlIndex == null)
        {
            return BadRequest(
                new Response { Error = "Customer division does not have a waitingListIndex" }
            );
        }

        // Select all customers that appear after this one in the waiting list queue
        IQueryable<CustomerDivision> cdsToUpdate = _context.CustomerDivision.Where(oldCd =>
            oldCd.DivisionOfficeId == customerDivision.DivisionOfficeId
            && oldCd.DivisionName == customerDivision.DivisionName
            && oldCd.WaitingListIndex > wlIndex
        );

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
    private async Task<ActionResult<Response>?> UpdateCustomerDivisionStatus(
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
            var res = RemoveCustomerDivisionWaitingListIndex(customerDivisionToUpdate);
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
    private ActionResult<Response>? UpdateCustomerDivisionWaitingListIndex(
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
            return BadRequest(
                new Response
                {
                    Error = $"'waitingListIndex' property must be a positive non-zero integer."
                }
            );
        }

        // This is the maximum legal value for the new waiting list index
        int? maxPossibleIndex = _context
            .CustomerDivision.Where(cd =>
                cd.DivisionOfficeId == officeId && cd.DivisionName == divisionName
            )
            .Max(cd => cd.WaitingListIndex);

        // If this customer didn't already have a waiting list index, the maximum index increases by 1 because the customer is being inserted into the waiting list
        if (oldWaitingListIndex == null && maxPossibleIndex != null)
        {
            maxPossibleIndex++;
        }

        // If no customers are in the waiting list, the maximum possible index is 1
        maxPossibleIndex ??= 1;

        // Check that the waitingListIndex property is within bounds
        if (customerDivision.WaitingListIndex > maxPossibleIndex)
        {
            return BadRequest(
                new Response
                {
                    Error =
                        $"The 'waitingListIndex' prop of division '{divisionName}' is out of bounds. The maximum allowed value is {maxPossibleIndex}."
                }
            );
        }

        // Get the waiting list for this customer's division
        IQueryable<CustomerDivision> waitingList = _context.CustomerDivision.Where(cd =>
            cd.DivisionOfficeId == officeId
            && cd.DivisionName == divisionName
            && cd.WaitingListIndex != null
        );

        // The if statements update the waiting list indexes for other customers in waiting list
        if (oldWaitingListIndex == null)
        {
            IQueryable<CustomerDivision> cdsToUpdate = waitingList.Where(cd =>
                cd.WaitingListIndex >= newWaitingListIndex
            );

            foreach (CustomerDivision cdToUpdate in cdsToUpdate)
            {
                cdToUpdate.WaitingListIndex++;
            }
        }
        else if (newWaitingListIndex < oldWaitingListIndex)
        {
            IQueryable<CustomerDivision> cdsToUpdate = waitingList.Where(cd =>
                cd.WaitingListIndex < oldWaitingListIndex
                && cd.WaitingListIndex >= newWaitingListIndex
            );

            foreach (CustomerDivision cdToUpdate in cdsToUpdate)
            {
                cdToUpdate.WaitingListIndex++;
            }
        }
        else if (newWaitingListIndex > oldWaitingListIndex)
        {
            IQueryable<CustomerDivision> cdsToUpdate = waitingList.Where(oldCustomerDivision =>
                oldCustomerDivision.WaitingListIndex <= newWaitingListIndex
                && oldCustomerDivision.WaitingListIndex > oldWaitingListIndex
            );

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
    private async Task<ActionResult<Response>?> UpdateCustomerDivision(
        Guid officeId,
        Guid customerId,
        PatchCustomerBody.PatchCustomerBodyDivision cdNewProps
    )
    {
        // Without division name, there would be no way to know which customer division to update
        if (cdNewProps.Name == null)
        {
            return BadRequest(
                new Response { Error = "Must provide a 'name' property for each division" }
            );
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
                new Response
                {
                    Error =
                        $"This customer does not belong to any division with the name '{cdNewProps.Name}'"
                }
            );
        }

        // Update division status
        if (cdNewProps.Status != null)
        {
            /* Require the 'waitingListIndex' property if the customer's status is being updated to 'Waiting' */
            if (cdNewProps.Status == "Waiting" && cdNewProps.WaitingListIndex == null)
            {
                return BadRequest(
                    new Response
                    {
                        Error =
                            "Customers whose status is being updated to 'Waiting' must have a 'waitingListIndex' property"
                    }
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
                    new Response
                    {
                        Error =
                            "The 'waitingListIndex' property can only be updated for customers whose status is 'Waiting'."
                    }
                );
            }

            var response = UpdateCustomerDivisionWaitingListIndex(
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
    public async Task<ActionResult<Response>> PatchCustomer(
        Guid officeId,
        Guid customerId,
        [FromBody] PatchCustomerBody cdsToUpdate
    )
    {
        // Check that customer exists
        Customer? customer = await _context.Customer.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound(new Response { Error = $"No customer found with id {customerId}" });
        }

        if (cdsToUpdate.Divisions != null)
        {
            // Error handling for empty divisions array
            if (cdsToUpdate.Divisions.Count == 0)
            {
                return BadRequest(new Response { Error = "Must provide at least one division" });
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
            return BadRequest(new Response { Error = "Must provide a 'Divisions' property" });
        }

        // Save changes to the database
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving changes to the database.");
            return StatusCode(
                500,
                new Response { Error = "Error saving changes to the database." }
            );
        }

        // Notify all clients that the customers have been updated
        try
        {
            await _hubContext.Clients.All.SendAsync("customersUpdated");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SignalR message.");
            return StatusCode(500, new Response { Error = "Error sending SignalR message." });
        }

        // Return the updated customer
        return await GetCustomer(customerId);
    }

    /*****************/
    /* GET CUSTOMERS */
    /*****************/

    [Authorize]
    [HttpPost("offices/{officeId}/customers/query")]
    public async Task<ActionResult<Response>> GetCustomersWithFilters(
        Guid officeId,
        [FromBody] CustomersQueryBody filters
    )
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest(new Response { Error = "Invalid officeId provided" });
        }

        // Check that division filters are valid
        if (filters.Divisions != null)
        {
            foreach (CustomersQueryBody.CustomersQueryBodyDivision division in filters.Divisions)
            {
                // Check that each division has a name prop
                if (division.Name == null)
                {
                    return BadRequest(
                        new Response { Error = "Must provide a 'name' property for each division" }
                    );
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
                        return BadRequest(
                            new Response { Error = $"Office has no division '{division.Name}'" }
                        );
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
                new Response
                {
                    Error =
                        "Must provide at least one filter property. Available filter properties: 'Divisions', 'Dates'"
                }
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
                return Ok(new Response { Data = new List<CustomerDto>() });
            }
        }

        // Filter by dates
        if (filters.Dates != null)
        {
            if (filteredCustomers.Count == 0)
            {
                foreach (var dateFilter in filters.Dates)
                {
                    _logger.LogInformation(dateFilter.Date.ToString());
                    var customersWithCurrentFilter = await _context
                        .Customer.Where(c =>
                            c.CheckInTime.Date == dateFilter.Date
                            && c.Divisions.Any(d => d.DivisionOfficeId == officeId)
                        )
                        // .OrderBy(c => c.CheckInTime)
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
                        .Where(c => c.CheckInTime.Date == dateFilter.Date)
                        .ToList();
                }
            }

            if (filteredCustomers.Count == 0)
            {
                return Ok(new Response { Data = new List<CustomerDto>() });
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

        return Ok(new Response { Data = customers });
    }

    [Authorize]
    [HttpGet("customers/{customerId}")]
    public async Task<ActionResult<Response>> GetCustomer(Guid customerId)
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
            return NotFound(new Response { Error = $"No customer found with id {customerId}" });
        }

        return Ok(new Response { Data = customer[0] });
    }

    [Authorize]
    [HttpPost("offices/{officeId}/customers")]
    public async Task<ActionResult<Response>> PostCustomerToOffice(
        Guid officeId,
        [FromBody] CustomerPostedInOffice postedCustomer
    )
    {
        Guid customerId = Guid.NewGuid();
        DateTime checkInTime = DateTime.UtcNow;

        // Check for errors in request body
        if (postedCustomer.divisionNames.Length == 0)
        {
            return BadRequest(new Response { Error = "Please include at least one division" });
        }

        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest(new Response { Error = "Invalid officeId provided" });
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
            List<Division> divisions = _context
                .Division.Where(d => d.Name == divisionName && d.OfficeId == officeId)
                .ToList();

            // If no divisions are found, return an error
            if (divisions.Count == 0)
            {
                return BadRequest(
                    new Response { Error = $"Invalid division '{divisionName}' provided" }
                );
            }
            else
            {
                int? maxWLIndex = _context
                    .CustomerDivision.Where(cd =>
                        cd.DivisionOfficeId == officeId && cd.DivisionName == divisionName
                    )
                    .Max(cd => cd.WaitingListIndex);
                maxWLIndex ??= 0;

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
            return NotFound(new Response { Error = $"No customer found with id {customerId}" });
        }

        List<CustomerDivision> cds = await _context
            .CustomerDivision.Where(cd => cd.CustomerId == customerId)
            .ToListAsync();

        if (cds.Count != 0)
        {
            foreach (CustomerDivision cd in cds)
            {
                if (DeskRegex().IsMatch(cd.Status))
                {
                    // TODO: Update UserAtDesk table
                }

                // Update waitingListIndexes for division
                if (cd.Status == "Waiting" && cd.WaitingListIndex != null)
                {
                    int wlIndex = (int)cd.WaitingListIndex;
                    List<CustomerDivision> cdsToUpdate = await _context
                        .CustomerDivision.Where(cdToUpdate =>
                            cdToUpdate.CustomerId != customerId
                            && cdToUpdate.DivisionName == cd.DivisionName
                            && cdToUpdate.DivisionOfficeId == officeId
                            && cdToUpdate.WaitingListIndex > wlIndex
                        )
                        .ToListAsync();
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

        return Ok(new Response { Data = customerToDelete[0] });
    }

    [GeneratedRegex(@"^Desk\s\d+$")]
    private static partial Regex DeskRegex();

    private class DeskDto
    {
        public int DeskNumber { get; set; }
        public bool Occupied { get; set; }
    }

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
                OccupiedDeskNumbers = d.Desks == null
                    ? new List<int>()
                    : d
                        .Desks.Where(d => d.UserAtDesk != null)
                        .Select(desk => desk.UserAtDesk == null ? 0 : desk.UserAtDesk.DeskNumber)
                        .ToList()
            })
            .ToListAsync();

        return Ok(divisions);
    }

    // Remove user from desk
    [Authorize(Policy = "AtDesk")]
    [HttpDelete("offices/{officeId}/users/{userId}/desk")]
    public async Task<ActionResult<Response>> RemoveUserFromDesk(Guid officeId, Guid userId)
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest(new Response { Error = "Invalid officeId provided" });
        }

        // Check that userId is valid
        User? user = await _context.User.FindAsync(userId);
        if (user == null)
        {
            return BadRequest(new Response { Error = "Invalid userId provided" });
        }

        // Check that the user is a member of the office
        UserOffice? userOffice = await _context.UserOffice.FindAsync(userId, officeId);
        if (userOffice == null)
        {
            return BadRequest(new Response { Error = "User is not a member of the office" });
        }

        // Check that the user is at a desk
        UserAtDesk? atDesk = await _context
            .UserAtDesk.Where(at => at.UserId == userId)
            .FirstOrDefaultAsync();
        if (atDesk == null)
        {
            return BadRequest(new Response { Error = "User is not at a desk" });
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
            List<CustomerDivision> fd = await _context
                .CustomerDivision.Where(cd =>
                    cd.DivisionOfficeId == atDesk.DeskDivisionOfficeId
                    && cd.DivisionName == atDesk.DeskDivisionName
                    && cd.Status == "Waiting"
                    && cd.WaitingListIndex != null
                )
                .ToListAsync();

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
                return BadRequest(new Response { Error = "Customer's division not found" });
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
    public async Task<ActionResult<Response>> PostUserToDesk(
        Guid officeId,
        Guid userId,
        [FromBody] PostedDesk postedDesk
    )
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest(new Response { Error = "Invalid officeId provided" });
        }

        // Check that userId is valid
        User? user = await _context.User.FindAsync(userId);
        if (user == null)
        {
            return BadRequest(new Response { Error = "Invalid userId provided" });
        }

        // Check that the user is a member of the office
        UserOffice? userOffice = await _context.UserOffice.FindAsync(userId, officeId);
        if (userOffice == null)
        {
            return BadRequest(new Response { Error = "User is not a member of the office" });
        }

        // Check that the user is not already at a desk
        UserAtDesk? atDesk = await _context
            .UserAtDesk.Where(at => at.UserId == userId)
            .FirstOrDefaultAsync();
        if (atDesk != null)
        {
            return BadRequest(new Response { Error = "User is already at a desk" });
        }

        // Check that the division name is valid
        Division? division = await _context.Division.FindAsync(postedDesk.DivisionName, officeId);
        if (division == null)
        {
            return BadRequest(new Response { Error = "Invalid division name provided" });
        }

        // Check that the desk number is valid
        if (postedDesk.Number < 1 || postedDesk.Number > division.MaxNumberOfDesks)
        {
            return BadRequest(new Response { Error = "Invalid desk number provided" });
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
            return BadRequest(new Response { Error = "Desk is already occupied" });
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

        return Ok(new
            {
                DivisionName = newUserAtDesk.DeskDivisionName,
                Number = newUserAtDesk.DeskNumber
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
            return BadRequest(
                new Response { Error = "Username must be at least 8 characters long" }
            );
        }
        if (user.Password.Length < 8)
        {
            return BadRequest(
                new Response { Error = "Password must be at least 8 characters long" }
            );
        }

        List<User> existingUser = await _context
            .User.Where(u => u.Username == user.Username)
            .ToListAsync();
        if (existingUser.Count >= 1)
        {
            return BadRequest(new Response { Error = "Username already exists" });
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
                return BadRequest(new Response { Error = $"No office found with id {officeId}" });
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
            new Response
            {
                Data = new
                {
                    Id = newUser.Id,
                    newUser.Username,
                    newUser.FirstName,
                    newUser.LastName
                }
            }
        );
    }

    [Authorize]
    [HttpGet("offices/{officeId}")]
    public async Task<ActionResult<Response>> GetOffice(Guid officeId)
    {
        Office? office = await _context
            .Office.Include(o => o.Divisions)
            .FirstOrDefaultAsync(o => officeId == o.Id);

        if (office == null)
        {
            return NotFound(new Response { Error = $"No office found with id {officeId}" });
        }

        if (office.Divisions == null)
        {
            return BadRequest(new Response { Error = "No divisions found for this office" });
        }

        return new Response
        {
            Data = new
            {
                office.Id,
                office.Name,
                DivisionNames = office.Divisions.Select(d => d.Name).ToList()
            }
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
            return BadRequest(new Response { Error = "Username not found" });
        }

        // Check if the password is correct
        if (user.Password != null)
        {
            if (!BCrypt.Net.BCrypt.EnhancedVerify(user.Password, existingUser.PasswordHash))
            {
                return BadRequest(new Response { Error = "Incorrect password" });
            }
        }
        else
        {
            return BadRequest(new Response { Error = "Password cannot be null" });
        }

        // JWT token generation starts here
        var jwtKey = _config["Jwt:Key"];
        if (jwtKey == null)
        {
            return BadRequest(new Response { Error = "JWT key not found" });
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
            expires: DateTime.UtcNow.AddMinutes(480),
            signingCredentials: credentials
        );

        var token = new JwtSecurityTokenHandler().WriteToken(Sectoken);
        // JWT token generation ends here

        return Ok(
            new Response
            {
                Data = new
                {
                    Id = existingUser.Id,
                    existingUser.Username,
                    existingUser.FirstName,
                    existingUser.LastName,
                    Token = token
                }
            }
        );
    }

    [HttpGet("users/self")]
    [Authorize]
    public async Task<ActionResult<Response>> GetCurrentUser()
    {
        Claim? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized(new Response { Error = "Token does not contain a userId claim" });
        }

        // Get the username from the User property
        string userId = userIdClaim.Value;

        // If the username claim is not included in the JWT, return an error
        if (userId == null)
        {
            return Unauthorized(new Response { Error = "Token does not contain a username claim" });
        }

        Guid parsedId = Guid.Parse(userId);

        // Fetch the user data from the database
        User? user = await _context
            .User.Include(u => u.Desk)
            .FirstOrDefaultAsync(u => u.Id == parsedId);

        // If the user does not exist in the database, return an error
        if (user == null)
        {
            return NotFound(new Response { Error = "User not found" });
        }

        // Return the user data
        return Ok(
            new Response
            {
                Data = new
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
                            Number = user.Desk.DeskNumber
                        }
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

public class Response
{
    public string? Error { get; init; }
    public dynamic? Data { get; init; }
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
