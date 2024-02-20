using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerApi.Models;

namespace CustomerApi.Controllers;

[Route("api/v1/")]
[ApiController]
public class CustomerController : ControllerBase
{
    private readonly CustomerContext _context;
    private readonly ILogger<CustomerController> _logger;

    // private readonly IConfiguration _configuration;


    public CustomerController(CustomerContext context, ILogger<CustomerController> logger)
    {
        _context = context;
        _logger = logger;
        // var debugString = _context.Model.ToDebugString();
        // _logger.LogInformation("Context Model Debug String: {DebugString}", debugString);
    }

    // GET /customers
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

    // POST /offices/:officeId/customers/query
    [HttpPost("offices/{officeId}/customers/query")]
    public async Task<ActionResult<ApiResponse>> GetCustomersWithFilters(
        Guid officeId,
        [FromBody] CustomersQueryBody filters)
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if(office == null)
        {
            return new ApiResponse
            {
                Error = "Invalid officeId provided"
            };
        }

        // Check that division filters are valid
        if(filters.Divisions != null)
        {
            foreach(CustomersQueryBody.Division division in filters.Divisions)
            {
                // Check that each division has a name prop
                if(division.Name == null)
                {
                    return new ApiResponse
                    {
                        Error = "Must provide a 'name' property for each division"
                    };
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
                        return new ApiResponse
                        {
                            Error = $"Office has no division '{division.Name}'"
                        };
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
            return new ApiResponse { Error = "Must provide at least one filter property. Available filter properties: 'Divisions', 'Dates'" };
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
                    .Include(c => c.Divisions)
                    .ThenInclude(d => d.TimesCalled)
                    .ToListAsync();

                filteredCustomers.AddRange(customersWithCurrentFilter);
            }
            

            if(filteredCustomers.Count == 0)
            {
                return new ApiResponse 
                { 
                    Error = "No customers found in any of the specified divisions" 
                };
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
                return new ApiResponse
                {
                    Error = "No customers found whose check in time matched any of the specified dates"
                };
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
        ).ToList();
        
        return new ApiResponse
        {
            Data = customers
        };
    }

    [HttpGet("divisions")]
    public async Task<ActionResult<IEnumerable<Division>>> GetDivisions()
    {
        return await _context.Division.ToListAsync();
    }

    // GET /customers/:id
    [HttpGet("customers/{id}")]
    public async Task<ActionResult<Customer>> GetCustomer(string id)
    {
        var customer = await _context.Customer.FindAsync(id);

        if (customer == null)
        {
            return NotFound();
        }

        return customer;
    }

    [HttpGet("divisions/{id}")]
    public async Task<ActionResult<Division>> GetDivision(string id)
    {
        var division = await _context.Division.FindAsync(id);


        if (division == null)
        {
            return NotFound();
        }

        return division;
    }

    [HttpGet("customer-divisions/{id}")]
    public async Task<ActionResult<CustomerDivision>> GetCustomerDivision(string id)
    {
        var customerDivision = await _context.CustomerDivision.FindAsync(id);


        if (customerDivision == null)
        {
            return NotFound();
        }

        return customerDivision;
    }

    // PUT: api/Customers/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("customers/{id}")]
    public async Task<IActionResult> PutCustomer(Guid id, Customer customer)
    {
        if (id != customer.CustomerId)
        {
            return BadRequest();
        }

        _context.Entry(customer).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CustomerExists(id))
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

    // POST: offices/:officeId/customers
    [HttpPost("offices/{officeId}/customers")]
    public async Task<ActionResult<ApiSingleResponse>> PostCustomerToOffice(
        Guid officeId, 
        [FromBody] CustomerPostedInOffice postedCustomer)
    {
        Guid customerId = Guid.NewGuid();
        DateTime checkInTime = DateTime.Now;

        // Check for errors in request body
        if(postedCustomer.divisions.Length == 0)
        {
            return new ApiSingleResponse
            {
                error = "Please include at least one division"
            };
        }

        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if(office == null)
        {
            return new ApiSingleResponse
            {
                error = "Invalid officeId provided"
            };
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
        foreach(string divisionName in postedCustomer.divisions)
        {
            // Find divisions with the given name and officeId
            List<Division> divisions = _context.Division
                .Where(d => d.DivisionName == divisionName && d.OfficeId == officeId).ToList();

            // If no divisions are found, return an error
            if(divisions.Count == 0)
            {
                return new ApiSingleResponse
                {
                    error = $"Invalid division '{divisionName}' provided"
                };
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
        
        await _context.SaveChangesAsync();

        return new ApiSingleResponse
        {
            customer = customer
        };
    }

    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost("customers")]
    // public async Task<ActionResult<Customer>> PostCustomer([FromBody] JObject postedCustomer)
    public async Task<ActionResult<Customer>> PostCustomer([FromBody] PostedCustomer postedCustomer)
    {
        
        // Guid uuid = Guid.NewGuid();
        // Guid customerId = uuid;
        string fullName = postedCustomer.fullName;
        string[] divisions = postedCustomer.divisions;
        // DateTime checkInTime = DateTime.Now;

        Customer customer = new Customer
        {
            FullName = fullName,
            // CustomerId = customerId,
            // CheckInTime = checkInTime
        };

        if (divisions.Length > 0)
        {
            CustomerDivision customerDivision;
            foreach (string division in divisions)
            {
                customerDivision = new CustomerDivision
                {
                    CustomerId = customer.CustomerId,
                    DivisionName = division, // Fix this
                    Status = "Waiting",
                    OfficeId = postedCustomer.officeId
                };

                await PostCustomerDivision(customerDivision);
            }
        }

        _context.Customer.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCustomer), 
            new { id = customer.CustomerId }, 
            customer
        );
    }

    [HttpPost("divisions")]
    public async Task<ActionResult<Division>> PostDivision(Division division)
    {
        _context.Division.Add(division);
        await _context.SaveChangesAsync();

        //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
        return CreatedAtAction(nameof(GetDivision), new { id = division.DivisionName }, division);
    }


    [HttpPost("customer-divisions")]
    public async Task<ActionResult<CustomerDivision>> PostCustomerDivision(CustomerDivision customerDivision)
    {
        _context.CustomerDivision.Add(customerDivision);
        await _context.SaveChangesAsync();

        //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
        return CreatedAtAction(nameof(GetDivision), new { id = customerDivision.DivisionName }, customerDivision);
    }


    // DELETE: api/Customers/5
    [HttpDelete("customers/{id}")]
    public async Task<IActionResult> DeleteCustomer(string id)
    {
        var customer = await _context.Customer.FindAsync(id);
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
    public required string[] divisions { get; init; }
}

public class ApiSingleResponse 
{
    public string? error { get; init; }
    public Customer? customer { get; init; }
}

public class ApiResponse
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
