using Microsoft.EntityFrameworkCore;

// namespace TodoApi.Models;
namespace CustomerApi.Models;

public class CustomerContext : DbContext
{

    // public DbSet<Customer> Customers { get; set; }
    // public DbSet<Division> Divisions { get; set; }
    public CustomerContext(DbContextOptions<CustomerContext> options)
        : base(options)
    {
    }


    public DbSet<Customer> CUSTOMER { get; set; } = null!;
}