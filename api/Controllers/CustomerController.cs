using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerApi.Models;
using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace CustomerApi.Controllers;

[Route("api/v1/")]
[ApiController]
public partial class CustomerController : ControllerBase
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

    [HttpPatch("offices/{officeId}/customers/{customerId}")]
    public async Task<ActionResult<Response>> PatchCustomer(
        Guid officeId,
        Guid customerId,
        [FromBody] CustomerPatchBody customerFields
    )
    {
        // Check that customer exists
        Customer? customer = await _context.Customer.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound();
        }

        if (customerFields.Divisions != null)
        {
            foreach (CustomerPatchBody.CustomerPatchBodyDivision div in customerFields.Divisions)
            {
                if (div.Name == null)
                {
                    return BadRequest();
                }

                CustomerDivision? cd = await _context.CustomerDivision.FindAsync(
                    customerId,
                    officeId,
                    div.Name
                );

                if (cd == null)
                {
                    return BadRequest(new Response
                    {
                        Error = $"This customer does not belong to any divisions with the name '{div.Name}'"
                    });
                }

                if (div.Status != null)
                {
                    if (div.Status == "Waiting" &&
                        cd.Status != "Waiting" &&
                        div.WaitingListIndex == null)
                    {
                        return BadRequest(new Response
                        {
                            Error = $"Customers whose status is being updated to 'Waiting' must have a 'waitingListIndex' property"
                        });
                    }

                    // TODO: Validate Desk status

                    // If a customer is transitioning from 'Waiting' to 'Desk X', the current time should be added to their timesCalled
                    if (cd.Status == "Waiting" && DeskRegex().IsMatch(div.Status))
                    {
                        CustomerDivisionTimeCalled cdtc = new CustomerDivisionTimeCalled
                        {
                            TimeCalled = DateTime.Now,
                            CustomerId = customerId,
                            DivisionName = div.Name,
                            OfficeId = officeId
                        };
                        await _context.CustomerDivisionTimeCalled.AddAsync(cdtc);
                    }

                    // If a customer is transitioning from 'Waiting' to any other status, their waitingListIndex should be null, and the existing customers need their indexes updated to fill the gap
                    if (cd.Status == "Waiting" &&
                        div.Status != "Waiting" &&
                        cd.WaitingListIndex != null)
                    {
                        int wlIndex = (int)cd.WaitingListIndex;

                        // Select all customers that appear after this one in the WL
                        IQueryable<CustomerDivision> cdsToUpdate = _context.CustomerDivision
                            .Where(cd => cd.OfficeId == officeId
                             && cd.DivisionName == div.Name
                             && cd.WaitingListIndex > wlIndex);

                        // Move selected customers up one position in WL
                        foreach (CustomerDivision cdToUpdate in cdsToUpdate)
                        {
                            cdToUpdate.WaitingListIndex--;
                        }

                        // Clear this customers WL index
                        cd.WaitingListIndex = null;
                    }

                    cd.Status = div.Status;
                }

                if (div.WaitingListIndex != null && cd.Status != "Waiting")
                {
                    return BadRequest(new Response
                    {
                        Error = "Cannot set the 'waitingListIndex' property on a customer whose status is not equal to 'Waiting'."
                    });
                }

                // Update waitingListIndex
                if (div.WaitingListIndex != null)
                {
                    // Check that waiting list index is valid
                    if (div.WaitingListIndex < 1)
                    {
                        return BadRequest(new Response
                        {
                            Error = $"'waitingListIndex' property must be a positive non-zero integer."
                        });
                    }

                    int? maxPossibleIndex = _context.CustomerDivision
                        .Where(cd => cd.OfficeId == officeId && cd.DivisionName == div.Name)
                        .Max(cd => cd.WaitingListIndex);
                    int? currentIndex = cd.WaitingListIndex;
                    int newIndex = (int)div.WaitingListIndex;

                    // If this customer does not have a waiting list index, it's possible to place them at the max wl index + 1
                    if (currentIndex == null && maxPossibleIndex != null)
                    {
                        maxPossibleIndex++;
                    }

                    maxPossibleIndex ??= 1;

                    if (div.WaitingListIndex > maxPossibleIndex)
                    {
                        return BadRequest(new Response
                        {
                            Error = $"The waitingListIndex property for division '{div.Name}' is out of bounds. The maximum possible value is {maxPossibleIndex}."
                        });
                    }

                    IQueryable<CustomerDivision> cdsToUpdate;

                    if (currentIndex == null)
                    {
                        cdsToUpdate = _context.CustomerDivision
                            .Where(cd => cd.WaitingListIndex >= newIndex);

                        foreach (CustomerDivision cdToUpdate in cdsToUpdate)
                        {
                            cdToUpdate.WaitingListIndex++;
                        }

                        cd.WaitingListIndex = newIndex;
                    }
                    else if (newIndex < currentIndex)
                    {
                        cdsToUpdate = _context.CustomerDivision
                            .Where(cd =>
                                cd.WaitingListIndex < currentIndex &&
                                cd.WaitingListIndex >= newIndex);

                        foreach (CustomerDivision cdToUpdate in cdsToUpdate)
                        {
                            cdToUpdate.WaitingListIndex++;
                        }

                        // Update customer's WL index
                        cd.WaitingListIndex = newIndex;
                    }
                    else if (newIndex > currentIndex)
                    {
                        cdsToUpdate = _context.CustomerDivision
                            .Where(cd => cd.WaitingListIndex <= newIndex &&
                                cd.WaitingListIndex > currentIndex);

                        foreach (CustomerDivision cdToUpdate in cdsToUpdate)
                        {
                            cdToUpdate.WaitingListIndex--;
                        }

                        cd.WaitingListIndex = newIndex;
                    }
                }
            }
        }

        await _context.SaveChangesAsync();
        // DateTime today = DateTime.Now;
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

    [HttpPost("offices/{officeId}/customers/query")]
    public async Task<ActionResult<Response>> GetCustomersWithFilters(
        Guid officeId,
        [FromBody] CustomersQueryBody filters)
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest(new Response
            {
                Error = "Invalid officeId provided"
            });
        }

        // Check that division filters are valid
        if (filters.Divisions != null)
        {
            foreach (CustomersQueryBody.CustomersQueryBodyDivision division in filters.Divisions)
            {
                // Check that each division has a name prop
                if (division.Name == null)
                {
                    return BadRequest(new Response
                    {
                        Error = "Must provide a 'name' property for each division"
                    });
                }
                else
                {
                    // Check that office has a division with the provided name
                    var divisionFound = await _context.Office
                        .Where(o => o.OfficeId == officeId && o.Divisions != null &&
                            o.Divisions.Any(d => d.DivisionName == division.Name))
                        .Include(o => o.Divisions)
                        .FirstOrDefaultAsync();

                    // Return error if division doesn't exist
                    if (divisionFound == null)
                    {
                        return BadRequest(new Response
                        {
                            Error = $"Office has no division '{division.Name}'"
                        });
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
            return BadRequest(new Response { Error = "Must provide at least one filter property. Available filter properties: 'Divisions', 'Dates'" });
        }

        // Initialize an empty list to hold the customers
        List<Customer> filteredCustomers = new List<Customer>();

        // Filter by divisions ...
        if (filters.Divisions != null)
        {
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


            if (filteredCustomers.Count == 0)
            {
                return NotFound(new Response
                {
                    Error = "No customers found in any of the specified divisions"
                });
            }
        }

        // Filter by dates
        if (filters.Dates != null)
        {
            if (filteredCustomers.Count == 0)
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
            }
            else
            {
                foreach (DateTime dateFilter in filters.Dates)
                {
                    filteredCustomers =
                        filteredCustomers.Where(c => c.CheckInTime.Date == dateFilter.Date).ToList();
                }
            }

            if (filteredCustomers.Count == 0)
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

        return new Response
        {
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
        if (postedCustomer.divisionNames.Length == 0)
        {
            return BadRequest(new Response
            {
                Error = "Please include at least one division"
            });
        }

        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
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
        foreach (string divisionName in postedCustomer.divisionNames)
        {
            // Find divisions with the given name and officeId
            List<Division> divisions = _context.Division
                .Where(d => d.DivisionName == divisionName && d.OfficeId == officeId).ToList();

            // If no divisions are found, return an error
            if (divisions.Count == 0)
            {
                return BadRequest(new Response
                {
                    Error = $"Invalid division '{divisionName}' provided"
                });
            }
            else
            {
                int? maxWLIndex = _context.CustomerDivision
                    .Where(cd => cd.OfficeId == officeId && cd.DivisionName == divisionName)
                    .Max(cd => cd.WaitingListIndex);
                maxWLIndex ??= 0;

                // Insert into CustomerDivision
                CustomerDivision cd = new CustomerDivision
                {
                    CustomerId = customerId,
                    DivisionName = divisionName,
                    Status = "Waiting",
                    OfficeId = officeId,
                    WaitingListIndex = maxWLIndex + 1
                };

                await _context.CustomerDivision.AddAsync(cd);
            }
        }

        // TODO: Fix this shit

        await _context.SaveChangesAsync();
        // DateTime today = DateTime.Now;
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

    [HttpDelete("offices/{officeId}/customers/{customerId}")]
    public async Task<ActionResult<CustomerDto>> DeleteCustomer(Guid officeId, Guid customerId)
    {
        Customer? customer = await _context.Customer.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound();
        }

        List<CustomerDivision> cds = await _context.CustomerDivision
            .Where(cd => cd.CustomerId == customerId).ToListAsync();

        if (cds.Count != 0)
        {
            foreach (CustomerDivision cd in cds)
            {
                if (DeskRegex().IsMatch(cd.Status))
                {
                    // TODO: Update AtDesk table
                }

                // Update waitingListIndexes for division
                if (cd.Status == "Waiting" && cd.WaitingListIndex != null)
                {
                    int wlIndex = (int)cd.WaitingListIndex;
                    List<CustomerDivision> cdsToUpdate = await _context.CustomerDivision
                        .Where(cdToUpdate =>
                            cdToUpdate.CustomerId != customerId &&
                            cdToUpdate.DivisionName == cd.DivisionName &&
                            cdToUpdate.OfficeId == officeId &&
                            cdToUpdate.WaitingListIndex > wlIndex).ToListAsync();
                    foreach (CustomerDivision cdToUpdate in cdsToUpdate)
                    {
                        cdToUpdate.WaitingListIndex--;
                    }
                }
            }
        }

        List<CustomerDto> customerToDelete = await _context.Customer
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

        _context.Customer.Remove(customer);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("customersUpdated");

        return customerToDelete[0];
    }

    private bool CustomerExists(Guid id)
    {
        return _context.Customer.Any(e => e.CustomerId == id);
    }

    [GeneratedRegex(@"^Desk\s\d+$")]
    private static partial Regex DeskRegex();

    [HttpGet("offices/{officeId}/divisions")]
    public async Task<ActionResult<IEnumerable<Division>>> GetDivisionsInOffice(Guid officeId)
    {
        var divisions = await _context.Division
            .Where(d => d.OfficeId == officeId)
            .Include(d => d.OccupiedDeskNums)
            .Select(d => new {
                Name = d.DivisionName,
                d.NumDesks,
                OccupiedDeskNums = d.OccupiedDeskNums == null ? 
                    new List<int>() 
                    : d.OccupiedDeskNums.Select(odn => odn.DeskNumber).ToList() 
            })
            .ToListAsync();

        return Ok(new Response
        {
            Data = divisions
        });
    }

    // Remove user from desk
    [HttpDelete("offices/{officeId}/users/{userId}/desk")]
    public async Task<ActionResult<Response>> RemoveUserFromDesk(
        Guid officeId,
        Guid userId)
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest(new Response
            {
                Error = "Invalid officeId provided"
            });
        }

        // Check that userId is valid
        User? user = await _context.User.FindAsync(userId);
        if (user == null)
        {
            return BadRequest(new Response
            {
                Error = "Invalid userId provided"
            });
        }

        // Check that the user is a member of the office
        UserOffice? userOffice = await _context.UserOffice.FindAsync(userId, officeId);
        if (userOffice == null)
        {
            return BadRequest(new Response
            {
                Error = "User is not a member of the office"
            });
        }

        // Check that the user is at a desk
        AtDesk? atDesk = await _context.AtDesk.Where(at => at.UserId == userId).FirstOrDefaultAsync();
        if (atDesk == null)
        {
            return BadRequest(new Response
            {
                Error = "User is not at a desk"
            });
        }

        // Remove user from desk
        _context.AtDesk.Remove(atDesk);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("desksUpdated");


        return Ok(new Response
        {
            Data = atDesk
        });
    }

    [HttpPost("offices/{officeId}/users/{userId}/desk")]
    public async Task<ActionResult<Response>> PostUserToDesk(
        Guid officeId,
        Guid userId,
        [FromBody] PostedDesk postedDesk)
    {
        // Check that officeId is valid
        Office? office = await _context.Office.FindAsync(officeId);
        if (office == null)
        {
            return BadRequest(new Response
            {
                Error = "Invalid officeId provided"
            });
        }

        // Check that userId is valid
        User? user = await _context.User.FindAsync(userId);
        if (user == null)
        {
            return BadRequest(new Response
            {
                Error = "Invalid userId provided"
            });
        }

        // Check that the user is a member of the office
        UserOffice? userOffice = await _context.UserOffice.FindAsync(userId, officeId);
        if (userOffice == null)
        {
            return BadRequest(new Response
            {
                Error = "User is not a member of the office"
            });
        }

        // Check that the user is not already at a desk
        AtDesk? atDesk = await _context.AtDesk.Where(at => at.UserId == userId).FirstOrDefaultAsync();
        if (atDesk != null)
        {
            return BadRequest(new Response
            {
                Error = "User is already at a desk"
            });
        }

        // Check that the division name is valid
        Division? division = await _context.Division.FindAsync(officeId, postedDesk.DivisionName);
        if (division == null)
        {
            return BadRequest(new Response
            {
                Error = "Invalid division name provided"
            });
        }

        // Check that the desk number is valid
        if (postedDesk.DeskNumber < 1 || postedDesk.DeskNumber > division.NumDesks)
        {
            return BadRequest(new Response
            {
                Error = "Invalid desk number provided"
            });
        }

        // Check that the desk is not already occupied
        AtDesk? deskOccupied = await _context.AtDesk.FindAsync(
            postedDesk.DeskNumber, 
            officeId, 
            postedDesk.DivisionName);
        if (deskOccupied != null)
        {
            return BadRequest(new Response
            {
                Error = "Desk is already occupied"
            });
        }

        // Insert into AtDesk
        AtDesk newAtDesk = new AtDesk
        {
            UserId = userId,
            OfficeId = officeId,
            DivisionName = postedDesk.DivisionName,
            DeskNumber = postedDesk.DeskNumber
        };
        await _context.AtDesk.AddAsync(newAtDesk);

        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("desksUpdated");

        return Ok(new Response
        {
            Data = newAtDesk
        });
    }

    [HttpPost("users")]
    public async Task<ActionResult<User>> AddUser(
        [FromBody] PostUserBody user)
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

        List<User> existingUser = await _context.User.Where(u => u.Username == user.Username).ToListAsync();
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
                return BadRequest("Office with ID " + officeId + " does not exist"); 
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
        User newUser = new() 
        {
            UserId = potentialUserId,
            Username = user.Username,
            Password = passwordHash,
            FirstName = user.FirstName,
            LastName = user.LastName
        };

        await _context.User.AddAsync(newUser);

        await _context.SaveChangesAsync();
        
        // Return created user to client
        return Ok(new Response
        {
            Data = new {
                Id = newUser.UserId,
                newUser.Username,
                newUser.FirstName,
                newUser.LastName
            }
        });
    }

    [HttpGet("offices/{officeId}")]
    public async Task<ActionResult<Response>> GetOffice(Guid officeId)
    {
        Office? office = await _context.Office
            .Include(o => o.Divisions)
            .FirstOrDefaultAsync(o => officeId == o.OfficeId);

        if (office == null)
        {
            return NotFound(new Response
            {
                Error = $"No office found with id {officeId}"
            });
        }

        if(office.Divisions == null)
        {
            return BadRequest(new Response
            {
                Error = "No divisions found for this office"
            });
        }

        return new Response{
            Data = new {
                Id = office.OfficeId,
                Name = office.OfficeName,
                DivisionNames = office.Divisions.Select(d => d.DivisionName).ToList()
            }
        };
    }

    [HttpPost("users/login")]
    public async Task<ActionResult<User>> LoginUser(
        [FromBody] LoginUserBody user)
    {
        // Check if there is a user with the specific username
        User? existingUser = await _context.User.Where(u => u.Username == user.Username).FirstOrDefaultAsync(u => u.Username == user.Username);

        if (existingUser == null)
        {
            return BadRequest("Username does not exist");
        }

        // Check if the password is correct
        if (!BCrypt.Net.BCrypt.EnhancedVerify(user.Password, existingUser.Password))
        {
            return BadRequest("Password is incorrect");
        }

        return Ok(new Response
        {
            Data = new {
                Id = existingUser.UserId,
                existingUser.Username,
                existingUser.FirstName,
                existingUser.LastName
            }
        });
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

public class CustomerPatchBody
{
    public List<CustomerPatchBodyDivision>? Divisions { get; set; }

    public class CustomerPatchBodyDivision
    {
        public required string Name { get; set; }
        public string? Status { get; set; }
        public int? WaitingListIndex { get; set; }
        public List<DateTime>? TimesCalled { get; set; }
    };
};

public class PostedDesk
{
    public required string DivisionName { get; init; }
    public required int DeskNumber { get; init; }
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

