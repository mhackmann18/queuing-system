using CustomerApi.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Services;

/* This service runs in the background and checks for expired desk sessions every minute.
   If a session has expired, the service will check if the desk was serving a customer, and 
   return said customer to the waiting list. The session is then removed,  */
public class DeskSessionCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public DeskSessionCleanupService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<CustomerContext>();
                var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SignalrHub>>();

                // Flag to check if customers were updated
                bool customersUpdated = false;

                // Find expired sessions
                var expiredSessions = await context.UserAtDesk
                    .Where(u => u.SessionEndTime <= DateTime.UtcNow).ToListAsync();

                foreach(var session in expiredSessions)
                {
                    // Check if there's a customer at the user's desk
                    var customersAtDesk = await context.CustomerAtDesk
                        .Where(c => c.DeskNumber == session.DeskNumber
                            && c.DeskDivisionName == session.DeskDivisionName
                            && c.DeskDivisionOfficeId == session.DeskDivisionOfficeId).ToListAsync();

                    // If there's a customer at the desk, set the customersUpdated flag to true
                    if(customersAtDesk.Count > 0)
                    {
                        customersUpdated = true;
                    }

                    /* If there's a customer at the desk, insert the customer into the beginning of 
                       the waiting list and remove their CustomerAtDesk record */
                    foreach(var cad in customersAtDesk)
                    {
                        // Find customer's division where customer is at a desk
                        var cd = await context.CustomerDivision
                            .Where(cd => cd.DivisionName == cad.DeskDivisionName
                                && cd.DivisionOfficeId == cad.DeskDivisionOfficeId
                                && cd.CustomerId == cad.CustomerId)
                            .FirstOrDefaultAsync();

                        // Return customer to division's waiting list
                        if(cd != null)
                        {
                            cd.Status = "Waiting";

                            // Update waitingListIndexes for all customers in this customer's division
                            List<CustomerDivision> fd = await context
                                .CustomerDivision.Where(cd =>
                                    cd.DivisionOfficeId == cad.DeskDivisionOfficeId
                                    && cd.DivisionName == cad.DeskDivisionName
                                    && cd.Status == "Waiting"
                                    && cd.WaitingListIndex != null
                                ).ToListAsync();

                            // Move all customers in the waiting list up one position
                            foreach (CustomerDivision cdToInc in fd)
                            {
                                cdToInc.WaitingListIndex++;
                            }

                            // Place this customer at the front of the waiting list
                            cd.WaitingListIndex = 1;
                        }

                        context.CustomerAtDesk.Remove(cad);
                    }
                }

                // Remove expired sessions
                context.UserAtDesk.RemoveRange(expiredSessions);

                await context.SaveChangesAsync();

                // Send updates to SignalR clients if there are any changes
                if(expiredSessions.Count > 0){
                    await hubContext.Clients.All.SendAsync("desksUpdated");
                }

                if(customersUpdated){
                    await hubContext.Clients.All.SendAsync("customersUpdated");
                }
            }

            // Wait before checking again
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
