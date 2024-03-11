namespace CustomerApi.Middleware;

public class SecretKeyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string? _secretKey;

    public SecretKeyMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        var secretKeyFilePath = configuration["SECRET_KEY_FILE_PATH"] ?? throw new Exception("SECRET_KEY_FILE_PATH environment variable is missing");
        _secretKey = File.ReadAllText(secretKeyFilePath).Trim();
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // If the request is to create a new customer, check the secret key
        if (context.Request.Method == HttpMethods.Post && context.Request.Path.Equals("/api/v1/users"))
        {
            var headerValue = context.Request.Headers["Secret-Key"].ToString().Trim();
            if (headerValue != _secretKey)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsync("Secret key is invalid.");
                return;
            }
        }

        await _next(context);
    }
}
