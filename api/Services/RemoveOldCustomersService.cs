using CustomerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Services;

public class ClearOldCustomersService : BackgroundService
{
    private readonly ILogger<ClearOldCustomersService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public ClearOldCustomersService(
        ILogger<ClearOldCustomersService> logger,
        IServiceProvider serviceProvider
    )
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<CustomerContext>();

                _logger.LogInformation(
                    "RemoveOldCustomersService running at: {time}",
                    DateTimeOffset.Now
                );

                var offices = await context.Office.ToListAsync(cancellationToken: stoppingToken);

                foreach (var office in offices)
                {
                    var officeTimezone = TimeZoneInfo.FindSystemTimeZoneById(office.Timezone);
                    var officeLocalTime = TimeZoneInfo.ConvertTimeFromUtc(
                        DateTime.UtcNow,
                        officeTimezone
                    );

                    // If it's the start of a new day at the office (12 AM >= officeLocalTime > 1 AM)
                    if (officeLocalTime.Hour < 1)
                    {
                        _logger.LogInformation(
                            "Removing old customers from office {officeName}",
                            office.Name
                        );

                        /* Remove customers whose check-in time doesn't match the new day, and whose
                        status is not "Served" or "No Show" */
                        var customersToRemove = context
                            .Customer.Include(c => c.Divisions)
                            .Where(c =>
                                c.Divisions.Any(d =>
                                    d.DivisionOfficeId == office.Id
                                    && d.Status != "Served"
                                    && d.Status != "No Show"
                                    && TimeZoneInfo
                                        .ConvertTimeFromUtc(c.CheckInTime, officeTimezone)
                                        .Date != officeLocalTime.Date
                                )
                            );

                        context.Customer.RemoveRange(customersToRemove);

                        await context.SaveChangesAsync(stoppingToken);
                    }
                }
            }

            // Run this service once every hour
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
