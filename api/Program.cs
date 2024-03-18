using CustomerApi.Models;
using CustomerApi.Requirements;
using CustomerApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Newtonsoft.Json;
using CustomerApi.Middleware;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Check that firebase credentials are set
if(builder.Configuration["FIREBASE_CREDENTIALS_FILE"] == null){
    throw new Exception("FIREBASE_CREDENTIALS_FILE environment variable is missing");
}

// Firebase configuration starts here
builder.Services.AddSingleton(FirebaseApp.Create(new AppOptions
{
    // Credential = GoogleCredential.GetApplicationDefault(),
    ProjectId = builder.Configuration["FIREBASE_PROJECT_ID"],
    Credential = GoogleCredential.FromFile(builder.Configuration["FIREBASE_CREDENTIALS_FILE"])
}));

// var defaultAuth = FirebaseAuth.GetAuth(defaultApp);

string? projectId = builder.Configuration["FIREBASE_PROJECT_ID"];

if(projectId == null){
    throw new Exception("FIREBASE_PROJECT_ID environment variable is missing");
}

builder
    .Services.AddAuthentication("Firebase")
    .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", null);
// Firebase configuration ends here

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

string? corsAllowedOrigin = builder.Configuration["CORS_ALLOWED_ORIGIN"];

if(corsAllowedOrigin == null){
    throw new Exception("CORS_ALLOWED_ORIGIN environment variable is missing");
}

app.UseCors(x =>
    x.AllowAnyMethod()
        .AllowAnyHeader()
        // .SetIsOriginAllowed(origin => true) // allow any origin
        .AllowCredentials()
        .WithOrigins(corsAllowedOrigin)
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
