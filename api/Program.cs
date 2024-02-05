// using TodoApi;
using CustomerApi;
using Microsoft.AspNetCore.Mvc;
// using Pomelo.EntityFrameworkCore.MySql;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Newtonsoft.Json;
using CustomerApi.Models;
using CustomerApi.Controllers;
using Microsoft.Extensions.Logging;

// Was using dotnet version 8.0.1


var builder = WebApplication.CreateBuilder(args);

using var connection = new MySqlConnection("Server=127.0.0.1;User ID=root;Password=SurfBreak1270!;Database='dmv3'");


// Add services to the container.


builder.Services.AddControllers();
// builder.Services.AddDbContext<CustomerContext>(opt =>
//     opt.UseInMemoryDatabase("My Database"));
Console.WriteLine(connection);
builder.Services.AddDbContext<CustomerContext>(opt =>
    opt.UseMySql(connection, new MySqlServerVersion(new Version(8, 0, 33)))
        .LogTo(Console.WriteLine));
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

app.Run();



// using System;
// using System.Linq;
// using CustomerApi.Models;

// using var db = new CustomerContext();

// // Note: This sample requires the database to be created before running.
// Console.WriteLine($"Database path: {db.DbPath}.");

// // Create
// Console.WriteLine("Inserting a new blog");
// db.Add(new Blog { Url = "http://blogs.msdn.com/adonet" });
// db.SaveChanges();

// // Read
// Console.WriteLine("Querying for a blog");
// var blog = db.Blogs
//     .OrderBy(b => b.BlogId)
//     .First();

// // Update
// Console.WriteLine("Updating the blog and adding a post");
// blog.Url = "https://devblogs.microsoft.com/dotnet";
// blog.Posts.Add(
//     new Post { Title = "Hello World", Content = "I wrote an app using EF Core!" });
// db.SaveChanges();

// // Delete
// Console.WriteLine("Delete the blog");
// db.Remove(blog);
// db.SaveChanges();














// GET api/v1/customers/{id}
// app.MapGet("/api/v1/customers/{id}", async ([FromServices] MySqlDataSource db, int id) =>
// {
//     var repository = new DMVRepository(db);
//     var result = await repository.GetCustomer(id);
//     Console.WriteLine(result.DriversLicense.Status);
//     string json = JsonConvert.SerializeObject(result, settings);

//     Console.WriteLine(json);
//     return result is null ? Results.NotFound() : Results.Ok(json);

//     // return result is null ? Results.NotFound() : Results.Ok(result);
// });

// GET api/v1/customers/{id}
// app.MapGet("/api/v1/customers/{id}", async ([FromServices] MySqlDataSource db, int id) =>
// {
//     var repository = new CustomerController(db);
//     var result = await repository.GetCustomer(id);
//     Console.WriteLine(result.DriversLicense.Status);
//     string json = JsonConvert.SerializeObject(result, settings);

//     Console.WriteLine(json);
//     return result is null ? Results.NotFound() : Results.Ok(json);

//     // return result is null ? Results.NotFound() : Results.Ok(result);
// });

// POST api/v1/customers


// app.MapPost

// app.Run();


// using Microsoft.AspNetCore.Builder;
// using Microsoft.AspNetCore.Hosting;
// using Microsoft.Extensions.Configuration;
// using Microsoft.Extensions.DependencyInjection;
// using Microsoft.Extensions.Hosting;
// using Microsoft.EntityFrameworkCore;
// using CustomerApi.Models;
// // using DotnetWebApiWithEFCodeFirst.Models;

// namespace CustomerApi
// {
//     public class Startup
//     {
//         public Startup(IConfiguration configuration)
//         {
//             Configuration = configuration;
//         }
//         public IConfiguration Configuration { get; }
//         public void ConfigureServices(IServiceCollection services)
//         {
//             services.AddControllers();
//             var connectionString = Configuration.GetConnectionString("Server=127.0.0.1;User ID=root;Password=SurfBreak1270!;Database='DMV v2'");
//             services.AddDbContext<CustomerContext>(options => options.UseSqlServer(connectionString));
//         }
//         public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
//         {
//             if (env.IsDevelopment())
//             {
//                 app.UseDeveloperExceptionPage();
//             }
//             app.UseRouting();
//             app.UseAuthorization();
//             app.UseEndpoints(endpoints =>
//             {
//                 endpoints.MapControllers();
//             });
//         }
//     }
// }
