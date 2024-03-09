using System.Text;
using CustomerApi.Models;
using CustomerApi.Requirements;
using CustomerApi.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MySqlConnector;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
if (builder.Environment.IsDevelopment())
{
    Env.Load(".env.dev");
}
else if(builder.Environment.IsProduction())
{
    Env.Load(".env.prod");
}

// Jwt configuration starts here
var jwtIssuer = builder.Configuration.GetSection("Jwt:Issuer").Get<string>();
var jwtKey = builder.Configuration.GetSection("Jwt:Key").Get<string>();

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
builder.Services.AddSignalR();

// MySql configuration
string? dbServer = Environment.GetEnvironmentVariable("DB_HOST");
string? dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
string? dbUser = Environment.GetEnvironmentVariable("DB_USER");
string? dbName = Environment.GetEnvironmentVariable("DB_NAME");

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
app.UseAuthorization();
app.MapControllers();
app.MapHub<SignalrHub>("/hub");

var settings = new JsonSerializerSettings
{
    Converters = new List<JsonConverter> { new Newtonsoft.Json.Converters.StringEnumConverter() },
    // Other settings...
};

app.Run();
