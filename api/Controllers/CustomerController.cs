using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerApi.Models;
using Microsoft.AspNetCore.SignalR;

namespace CustomerApi.Controllers;

[Route("api/v1/")]
[ApiController]
public class CustomerController : ControllerBase
{
    private readonly CustomerContext _context;
    private readonly IHubContext<SignalrHub> _hubContext;
    private readonly ILogger<CustomerController> _logger;

    public CustomerController(CustomerContext context, IHubContext<SignalrHub> hubContext, ILogger<CustomerController> logger)
    {
        _context = context;
        _logger = logger;
        _hubContext = hubContext;
    }

    [HttpGet("customers")]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
    {
        var customers = await _context.Customer
            .Select(c => new CustomerDto
            {
                Id = c.CustomerId,
                FullName = c.FullName,
                CheckInTime = c.CheckInTime,
                Divisions = c.Divisions.Select(d => new CustomerDivisionDto
                {
                    Name = d.DivisionName,
                    Status = d.Status,
                    WaitingListIndex = d.WaitingListIndex,
                    TimesCalled = d.TimesCalled.Select(t => t.TimeCalled).ToList()
                }).ToList()
            })
            .ToListAsync();

        return customers;
    }

    [HttpPost("offices/{officeId}/customers/query")]
    public async Task<ActionResult<Response>> GetCustomersWithFilters(
        Guid officeId,
        [FromBody] CustomersQueryBody filters)
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if(office == null)
        {
            return BadRequest(new Response
            {
                Error = "Invalid officeId provided"
            });
        }

        // Check that division filters are valid
        if(filters.Divisions != null)
        {
            foreach(CustomersQueryBody.Division division in filters.Divisions)
            {
                // Check that each division has a name prop
                if(division.Name == null)
                {
                    return BadRequest(new Response
                    {
                        Error = "Must provide a 'name' property for each division"
                    });
                } else {    
                    // Check that office has a division with the provided name
                    var divisionFound = await _context.Office
                        .Where(o => o.OfficeId == officeId && o.Divisions != null && 
                            o.Divisions.Any(d => d.DivisionName == division.Name))
                        .Include(o => o.Divisions)
                        .FirstOrDefaultAsync();

                    // Return error if division doesn't exist
                    if(divisionFound == null) 
                    {
                        return BadRequest(new Response
                        {
                            Error = $"Office has no division '{division.Name}'"
                        });
                    }
                }
                // Check that the provided statuses are valid
                if(division.Statuses != null)
                {
                    // TODO: Validate each status
                }
            }
        }

        // Check that request body has at least one required property
        if(filters.Divisions == null && filters.Dates == null)
        {
            return BadRequest(new Response { Error = "Must provide at least one filter property. Available filter properties: 'Divisions', 'Dates'" });
        }

        // Initialize an empty list to hold the customers
        List<Customer> filteredCustomers = new List<Customer>();

        // Filter by divisions ...
        if(filters.Divisions != null){
            foreach (var filter in filters.Divisions)
            {
                var customersWithCurrentFilter = await _context.Customer
                    .Where(c => c.Divisions.Any(d => 
                        d.OfficeId == officeId &&
                        d.DivisionName == filter.Name && 
                        (filter.Statuses == null || filter.Statuses.Contains(d.Status))))
                    // .OrderBy(c => c.CheckInTime)
                    .Include(c => c.Divisions)
                    .ThenInclude(d => d.TimesCalled)
                    .ToListAsync();

                filteredCustomers.AddRange(customersWithCurrentFilter);
            }
            

            if(filteredCustomers.Count == 0)
            {
                return NotFound(new Response 
                { 
                    Error = "No customers found in any of the specified divisions" 
                });
            }
        }

        // Filter by dates
        if(filters.Dates != null)
        {
            if(filteredCustomers.Count == 0)
            {
                foreach (var dateFilter in filters.Dates)
                {
                    var customersWithCurrentFilter = await _context.Customer
                        .Where(c => c.CheckInTime.Date == dateFilter.Date
                        && c.Divisions.Any(d => d.OfficeId == officeId))
                        // .OrderBy(c => c.CheckInTime)
                        .Include(c => c.Divisions)
                        .ThenInclude(d => d.TimesCalled)
                        .ToListAsync();

                    filteredCustomers.AddRange(customersWithCurrentFilter);
                }
            } else {
                foreach(DateTime dateFilter in filters.Dates)
                {
                    filteredCustomers = 
                        filteredCustomers.Where(c => c.CheckInTime.Date == dateFilter.Date).ToList();
                }
            }

            if(filteredCustomers.Count == 0)
            {
                return NotFound(new Response
                {
                    Error = "No customers found whose check in time matched any of the specified dates"
                });
            }
        }

        // Sanitize customers
        var customers = filteredCustomers.Select(c => new CustomerDto
            {
                Id = c.CustomerId,
                FullName = c.FullName,
                CheckInTime = c.CheckInTime,
                Divisions = c.Divisions.Select(d => new CustomerDivisionDto
                {
                    Name = d.DivisionName,
                    Status = d.Status,
                    WaitingListIndex = d.WaitingListIndex,
                    TimesCalled = d.TimesCalled.Select(t => t.TimeCalled).ToList()
                }).ToList()
            }
        )
                        .OrderBy(c => c.CheckInTime)
        .ToList();
        
        return Ok(new Response
        {
            Data = customers
        });
    }

    [HttpGet("divisions")]
    public async Task<ActionResult<IEnumerable<Division>>> GetDivisions()
    {
        return await _context.Division.ToListAsync();
    }

    [HttpGet("customers/{customerId}")]
    public async Task<ActionResult<Response>> GetCustomer(Guid customerId)
    {
        var customer = await _context.Customer
            .Where(c => c.CustomerId == customerId)
            .Select(c => new CustomerDto
            {
                Id = c.CustomerId,
                FullName = c.FullName,
                CheckInTime = c.CheckInTime,
                Divisions = c.Divisions.Select(d => new CustomerDivisionDto
                {
                    Name = d.DivisionName,
                    Status = d.Status,
                    WaitingListIndex = d.WaitingListIndex,
                    TimesCalled = d.TimesCalled.Select(t => t.TimeCalled).ToList()
                }).ToList()
            })
            .ToListAsync();

        if (customer.Count == 0)
        {
            return NotFound(new Response
            {
                Error = $"No customer found with id {customerId}"
            });
        }

        return new Response {
            Data = customer[0]
        };
    }

    // TODO: This should be offices/{officeId}/divisions/{divisionId}
    [HttpGet("divisions/{divisionId}")]
    public async Task<ActionResult<Division>> GetDivision(string divisionId)
    {
        var division = await _context.Division.FindAsync(divisionId);

        if (division == null)
        {
            return NotFound(new Response
            {
                Error = $"No division found with id {divisionId}"
            });
        }

        return division;
    }

    // TODO: The customer body will not have an id, as that data is already in the route
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("customers/{customerId}")]
    public async Task<IActionResult> PutCustomer(Guid customerId, Customer customer)
    {
        _context.Entry(customer).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CustomerExists(customerId))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpPost("offices/{officeId}/customers")]
    public async Task<ActionResult<Response>> PostCustomerToOffice(
        Guid officeId, 
        [FromBody] CustomerPostedInOffice postedCustomer)
    {
        Guid customerId = Guid.NewGuid();
        DateTime checkInTime = DateTime.Now;

        // Check for errors in request body
        if(postedCustomer.divisionNames.Length == 0)
        {
            return BadRequest(new Response
            {
                Error = "Please include at least one division"
            });
        }

        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if(office == null)
        {
            return BadRequest(new Response
            {
                Error = "Invalid officeId provided"
            });
        }

        // Insert into Customer
        Customer customer = new Customer
        {
            CustomerId = customerId,
            FullName = postedCustomer.fullName,
            CheckInTime = checkInTime
        };
        await _context.Customer.AddAsync(customer);

        // Insert divisions into CustomerDivision
        foreach(string divisionName in postedCustomer.divisionNames)
        {
            // Find divisions with the given name and officeId
            List<Division> divisions = _context.Division
                .Where(d => d.DivisionName == divisionName && d.OfficeId == officeId).ToList();

            // If no divisions are found, return an error
            if(divisions.Count == 0)
            {
                return BadRequest(new Response
                {
                    Error = $"Invalid division '{divisionName}' provided"
                });
            } 
            else 
            {
                // Insert into CustomerDivision
                CustomerDivision cd = new CustomerDivision
                {
                    CustomerId = customerId,
                    DivisionName = divisionName,
                    Status = "Waiting",
                    OfficeId = officeId
                };

                await _context.CustomerDivision.AddAsync(cd);
            }
        }

        // TODO: Fix this shit
        
        await _context.SaveChangesAsync();
        DateTime today = DateTime.Now;
        ActionResult<Response> res = await GetCustomersWithFilters(
            officeId, 
            new CustomersQueryBody{ Dates = new List<DateTime> { today } }
        );

        // Check if the result is a success
        if (res.Result is OkObjectResult okObjectResult)
        {
            Response response = okObjectResult.Value as Response;

            List<CustomerDto> c = response.Data;
            await _hubContext.Clients.All.SendAsync("customersUpdated", c);
            return await GetCustomer(customerId);
        } else {
            return res;
        }
    }

    // TODO: Create division in office; POST office/{officeId}/divisions
    [HttpPost("divisions")]
    public async Task<ActionResult<Division>> PostDivision(Division division)
    {
        _context.Division.Add(division);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDivision), new { id = division.DivisionName }, division);
    }

    // [HttpPost("customer-divisions")]
    // public async Task<ActionResult<CustomerDivision>> PostCustomerDivision(CustomerDivision customerDivision)
    // {
    //     _context.CustomerDivision.Add(customerDivision);
    //     await _context.SaveChangesAsync();

    //     //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
    //     return CreatedAtAction(nameof(GetDivision), new { id = customerDivision.DivisionName }, customerDivision);
    // }

    [HttpDelete("customers/{customerId}")]
    public async Task<IActionResult> DeleteCustomer(string customerId)
    {
        var customer = await _context.Customer.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound();
        }

        _context.Customer.Remove(customer);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CustomerExists(Guid id)
    {
        return _context.Customer.Any(e => e.CustomerId == id);
    }
}

public class PostedCustomer
{
    public required string fullName { get; set; }
    public required Guid officeId { get; set; }
    public required string[] divisions { get; set; }
};

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
    public List<Division>? Divisions { get; set; }
    public List<DateTime>? Dates { get; set; }

    public class Division
    {
        public required string Name { get; init; }
        public string[]? Statuses { get; init; } 
    }
}
