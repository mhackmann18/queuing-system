using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

public class CustomerContext(DbContextOptions<CustomerContext> options) : DbContext(options)
{
    public DbSet<Customer> Customer { get; set; } = null!;
    public DbSet<Division> Division { get; set; } = null!;
    public DbSet<CustomerDivision> CustomerDivision { get; set; } = null!;
}
