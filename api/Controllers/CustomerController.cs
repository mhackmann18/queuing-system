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
        if (id != customer.customerId)
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
    
    [HttpPost("customers")]
    // public async Task<ActionResult<Customer>> PostCustomer([FromBody] JObject postedCustomer)
    public async Task<ActionResult<Customer>> PostCustomer([FromBody] PostedCustomer postedCustomer)
    {
        
        Guid uuid = Guid.NewGuid();
        Guid customerId = uuid;
        string fullName = postedCustomer.fullName;
        string[] divisions = postedCustomer.divisions;
        DateTime checkInTime = DateTime.Now;

        Customer customer = new Customer
        {
            fullName = fullName,
            customerId = customerId,
            checkInTime = checkInTime
        };

        if (divisions.Length > 0)
        {
            CustomerDivision customerDivision;
            foreach (string division in divisions)
            {
                customerDivision = new CustomerDivision
                {
                    customerId = customerId,
                    divisionId = Guid.NewGuid(), // Fix this
                    Status = CustomerStatus.Waiting
                };

                await PostCustomerDivision(customerDivision);
            }
        }
        
        //  Customer customer = new Customer
        // {
        //     fullName = "js",
        //     customerId = "ks",
        //     checkInTime = DateTime.Now
        // };


        _context.Customer.Add(customer);
        await _context.SaveChangesAsync();

        //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.customerId }, customer);
    }
    // [HttpPost]
    // public async Task<ActionResult<Customer>> PostCustomer(Customer customer)
    // {
    //     _context.Customer.Add(customer);
    //     await _context.SaveChangesAsync();

    //     //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
    //     return CreatedAtAction(nameof(GetCustomer), new { id = customer.customerId }, customer);
    // }
    [HttpPost("divisions")]
    public async Task<ActionResult<Division>> PostDivision(Division division)
    {
        _context.Division.Add(division);
        await _context.SaveChangesAsync();

        //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
        return CreatedAtAction(nameof(GetDivision), new { id = division.divisionId }, division);
    }


    [HttpPost("customer-divisions")]
    public async Task<ActionResult<CustomerDivision>> PostCustomerDivision(CustomerDivision customerDivision)
    {
        _context.CustomerDivision.Add(customerDivision);
        await _context.SaveChangesAsync();

        //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
        return CreatedAtAction(nameof(GetDivision), new { id = customerDivision.divisionId }, customerDivision);
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
        return _context.Customer.Any(e => e.customerId == id);
    }
}


