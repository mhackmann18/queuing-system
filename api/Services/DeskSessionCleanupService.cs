using CustomerApi.Models;

namespace CustomerApi.Services;

public class SessionCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public SessionCleanupService(IServiceProvider serviceProvider)
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

                // Find expired sessions
                var expiredSessions = context.UserAtDesk
                    .Where(u => u.SessionEndTime <= DateTime.UtcNow);

                // Remove expired sessions
                context.UserAtDesk.RemoveRange(expiredSessions);

                await context.SaveChangesAsync();
            }

            // Wait before checking again
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}