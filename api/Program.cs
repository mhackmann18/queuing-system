using DMVApi;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Newtonsoft.Json;
using TodoApi.Models;

var builder = WebApplication.CreateBuilder(args);

using var connection = new MySqlConnection("Server=127.0.0.1;User ID=root;Password=SurfBreak1270!;Database='DMV v2'");


// Add services to the container.


builder.Services.AddControllers();
builder.Services.AddDbContext<TodoContext>(opt =>
    opt.UseInMemoryDatabase("TodoList"));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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


// GET api/blog/5
app.MapGet("/api/DMV/{id}", async ([FromServices] MySqlDataSource db, int id) =>
{
    var repository = new DMVRepository(db);
    var result = await repository.FindOneAsync(id);
    Console.WriteLine(result.DriversLicense.Status);
    string json = JsonConvert.SerializeObject(result, settings);

    Console.WriteLine(json);
    return result is null ? Results.NotFound() : Results.Ok(json);

    // return result is null ? Results.NotFound() : Results.Ok(result);
});

app.Run();


// "/api/DMV/{date}/{department}/{status}"