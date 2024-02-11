using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using CustomerApi.Models;
using Newtonsoft.Json.Linq;
// using TodoApi.Models;


// namespace TodoApi.Controllersdock
namespace CustomerApi.Controllers
{
    [Route("api/v1/")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly CustomerContext _context;

        // private readonly IConfiguration _configuration;


        public CustomerController(CustomerContext context)
        {
            _context = context;
        }

        // GET: api/Customers

        [HttpGet("customers")]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return await _context.CUSTOMER.ToListAsync();
        }

        [HttpGet("divisions")]
        public async Task<ActionResult<IEnumerable<Division>>> GetDivisions()
        {
            return await _context.DIVISION.ToListAsync();
        }

        // GET: api/Customers/5
        [HttpGet("customers/{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(string id)
        {
            var customer = await _context.CUSTOMER.FindAsync(id);


            if (customer == null)
            {
                return NotFound();
            }

            return customer;
        }
        [HttpGet("divisions/{id}")]
        public async Task<ActionResult<Division>> GetDivision(string id)
        {
            var division = await _context.DIVISION.FindAsync(id);


            if (division == null)
            {
                Console.WriteLine("Division not found");
                return NotFound();
            }

            return division;
        }
        [HttpGet("customer-divisions/{id}")]
        public async Task<ActionResult<CustomerDivision>> GetCustomerDivision(string id)
        {
            var customerDivision = await _context.CUSTOMERDIVISION.FindAsync(id);


            if (customerDivision == null)
            {
                return NotFound();
            }

            return customerDivision;
        }

        // PUT: api/Customers/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("customers/{id}")]
        public async Task<IActionResult> PutCustomer(string id, Customer customer)
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
            string customerId = uuid.ToString();
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
                        divisionId = division,
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


            _context.CUSTOMER.Add(customer);
            await _context.SaveChangesAsync();

            //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.customerId }, customer);
        }
        // [HttpPost]
        // public async Task<ActionResult<Customer>> PostCustomer(Customer customer)
        // {
        //     _context.CUSTOMER.Add(customer);
        //     await _context.SaveChangesAsync();

        //     //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
        //     return CreatedAtAction(nameof(GetCustomer), new { id = customer.customerId }, customer);
        // }
        [HttpPost("divisions")]
        public async Task<ActionResult<Division>> PostDivision(Division division)
        {
            _context.DIVISION.Add(division);
            await _context.SaveChangesAsync();

            //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
            return CreatedAtAction(nameof(GetDivision), new { id = division.divisionId }, division);
        }


        [HttpPost("customer-divisions")]
        public async Task<ActionResult<CustomerDivision>> PostCustomerDivision(CustomerDivision customerDivision)
        {
            _context.CUSTOMERDIVISION.Add(customerDivision);
            await _context.SaveChangesAsync();

            //    return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
            return CreatedAtAction(nameof(GetDivision), new { id = customerDivision.divisionId }, customerDivision);
        }


        // DELETE: api/Customers/5
        [HttpDelete("customers/{id}")]
        public async Task<IActionResult> DeleteCustomer(string id)
        {
            var customer = await _context.CUSTOMER.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            _context.CUSTOMER.Remove(customer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CustomerExists(string id)
        {
            return _context.CUSTOMER.Any(e => e.customerId == id);
        }
    }
}
