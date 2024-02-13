using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
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
        var debugString = _context.Model.ToDebugString();
        _logger.LogInformation("Context Model Debug String: {DebugString}", debugString);
    }

    // GET: api/Customers

    [HttpGet("customers")]
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
    {
        _logger.LogInformation("called /customers");
        return await _context.Customer.ToListAsync();
    }

    [HttpGet("divisions")]
    public async Task<ActionResult<IEnumerable<Division>>> GetDivisions()
    {
        return await _context.Division.ToListAsync();
    }

    // GET: api/Customers/5
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

    // POST: api/Customers
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754

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
                error = "please include at least one division"
            };
        }

        Customer customer = new Customer
        {
            CustomerId = customerId,
            FullName = postedCustomer.fullName,
            CheckInTime = checkInTime
        };

        await _context.Customer.AddAsync(customer);

        // For each divisionName in divisions, find Division with officeId and divisionName. return error any division isn't found
        foreach(string divisionName in postedCustomer.divisions)
        {
            List<Division> division = 
            _context.Division
            .Where(d => d.DivisionName == divisionName)
            .ToList();
            // _logger.LogInformation(division.Count.ToString());

            if(division.Count == 0)
            {
                return new ApiSingleResponse
                {
                    error = $"Invalid division '{divisionName}' provided"
                };
            } else {
                Division div = division[0];

                // Insert into CustomerDivision
                CustomerDivision cd = new CustomerDivision
                {
                    CustomerId = customerId,
                    DivisionId = div.DivisionId,
                    Status = "Waiting"
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
                    DivisionId = Guid.NewGuid(), // Fix this
                    Status = "Waiting"
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
        return CreatedAtAction(nameof(GetDivision), new { id = division.DivisionId }, division);
    }


    [HttpPost("customer-divisions")]
    public async Task<ActionResult<CustomerDivision>> PostCustomerDivision(CustomerDivision customerDivision)
    {
        _context.CustomerDivision.Add(customerDivision);
        await _context.SaveChangesAsync();

        //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
        return CreatedAtAction(nameof(GetDivision), new { id = customerDivision.DivisionId }, customerDivision);
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
    public required string officeId { get; set; }
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
