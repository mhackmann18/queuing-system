// using Pomelo.EntityFrameworkCore.MySql;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Newtonsoft.Json;
using CustomerApi.Models;

var builder = WebApplication.CreateBuilder(args);

using var connection = new MySqlConnection("Server=127.0.0.1;User ID=root;Password=SurfBreak1270!;Database='queuing_system'");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<CustomerContext>(options =>
    options.UseMySql(connection, new MySqlServerVersion(new Version(8, 0, 33))));
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

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

var settings = new JsonSerializerSettings
{
    Converters = new List<JsonConverter> { new Newtonsoft.Json.Converters.StringEnumConverter() },
    // Other settings...
};

app.Run();
