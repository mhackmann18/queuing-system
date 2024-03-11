using System.Text;
using CustomerApi.Models;
using CustomerApi.Requirements;
using CustomerApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MySqlConnector;
using Newtonsoft.Json;
using CustomerApi.Middleware;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Jwt configuration starts here
var jwtIssuer = builder.Configuration.GetSection("Jwt:Issuer").Get<string>();
string? jwtKeyFilePath = builder.Configuration["JWT_SECRET_FILE"];

if(jwtKeyFilePath == null){
    throw new Exception("JWT_SECRET_FILE environment variable is missing");
}

string jwtKey = File.ReadAllText(jwtKeyFilePath);

if (string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtKey))
{
    throw new Exception("Jwt configuration is missing");
}

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            ClockSkew = TimeSpan.Zero, // TODO: Remove this line in production
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Response when unauthorized
        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse(); // Prevent the default behavior
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "text/plain";
                return context.Response.WriteAsync(
                    "Your credentials are invalid or have expired. Please log in again."
                );
            }
        };
    });

// Jwt configuration ends here

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AtDesk", policy => policy.AddRequirements(new AtDeskRequirement()));
});

// Add authorization handler to block users who are not at desk from accessing certain routes
builder.Services.AddScoped<IAuthorizationHandler, AtDeskHandler>();

// Clear old desk sessions
builder.Services.AddHostedService<DeskSessionCleanupService>();

// Clear any leftover unserved customers from the previous day
builder.Services.AddHostedService<ClearOldCustomersService>();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR(hubOptions =>
{
    hubOptions.EnableDetailedErrors = true;
});

// MySql configuration
string? dbServer = builder.Configuration["DB_HOST"];
string? dbPasswordPath = builder.Configuration["MYSQL_ROOT_PASSWORD_FILE"];

if(dbPasswordPath == null){
    throw new Exception("MYSQL_ROOT_PASSWORD_FILE environment variable is missing");
}

string dbPassword = File.ReadAllText(dbPasswordPath);
string? dbUser = builder.Configuration["DB_USER"];
string? dbName = builder.Configuration["DB_NAME"];

builder.Services.AddDbContext<CustomerContext>(options =>
    options.UseMySql(
        $"Server={dbServer};User ID={dbUser};Password={dbPassword};Database='{dbName}'",
        new MySqlServerVersion(new Version(8, 0, 33))
    )
);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMySqlDataSource(builder.Configuration.GetConnectionString("Default")!);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(x =>
    x.AllowAnyMethod()
        .AllowAnyHeader()
        .SetIsOriginAllowed(origin => true) // allow any origin
        .AllowCredentials()
); // allow credentials

app.UseHttpsRedirection();
app.UseMiddleware<WebSocketsMiddleware>();
app.UseMiddleware<SecretKeyMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<SignalrHub>("/hub");

var settings = new JsonSerializerSettings
{
    Converters = new List<JsonConverter> { new Newtonsoft.Json.Converters.StringEnumConverter() },
    // Other settings...
};

app.Run();
