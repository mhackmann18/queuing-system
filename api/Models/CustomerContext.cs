using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

public class CustomerContext : DbContext
{
    public CustomerContext(DbContextOptions<CustomerContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> CUSTOMER { get; set; } = null!;
    public DbSet<Division> DIVISION { get; set; } = null!;
    public DbSet<CustomerDivision> CUSTOMERDIVISION { get; set; } = null!;
}
