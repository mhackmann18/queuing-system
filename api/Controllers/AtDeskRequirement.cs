using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CustomerApi.Models;

namespace CustomerApi.Requirements;

public class AtDeskRequirement : IAuthorizationRequirement { }

public class AtDeskHandler : AuthorizationHandler<AtDeskRequirement>
{
    private readonly CustomerContext _context;

    public AtDeskHandler(CustomerContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, AtDeskRequirement requirement)
    {
        var userIdClaim = context.User.FindFirst(claim => claim.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            var userAtDesk = await _context.UserAtDesk.FirstOrDefaultAsync(u => u.UserId == userId);
            if (userAtDesk != null)
            {
                await _context.SaveChangesAsync();
                context.Succeed(requirement);
            }
        }
    }
}
