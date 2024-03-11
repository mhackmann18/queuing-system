using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace CustomerApi.Middleware;

// Credit to https://medium.com/@tarik.nzl/asp-net-core-and-signalr-authentication-with-the-javascript-client-d46c15584daf
public class WebSocketsMiddleware
{
    private readonly RequestDelegate _next;

    public WebSocketsMiddleware(RequestDelegate next, ILogger<WebSocketsMiddleware> logger)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext)
    {
        var request = httpContext.Request;

        /* Web sockets cannot pass headers so we must take the access token from query param and
        add it to the header before authentication middleware runs */
        if (request.Path.StartsWithSegments("/hub", StringComparison.OrdinalIgnoreCase) &&
            request.Query.TryGetValue("access_token", out var accessToken))
        {
            request.Headers.Append("Authorization", $"Bearer {accessToken}");
        }

        await _next(httpContext);
    }
}
