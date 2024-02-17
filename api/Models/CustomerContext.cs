using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

public class CustomerContext(DbContextOptions<CustomerContext> options) : DbContext(options)
{
    public DbSet<Customer> Customer { get; set; } = null!;
    public DbSet<Division> Division { get; set; } = null!;
    public DbSet<CustomerDivision> CustomerDivision { get; set; } = null!;
    public DbSet<CustomerDivisionTimeCalled> CustomerDivisionTimeCalled { get; set; } = null!;
    public DbSet<Office> Office { get; set; } = null!;

    // If this method gets too big, see 'grouping configuration' 
    // in https://learn.microsoft.com/en-us/ef/core/modeling/
    // protected override void OnModelCreating(ModelBuilder modelBuilder)
    // {
    //     // Fluent API
    //     modelBuilder.Entity<CustomerDivision>()
    //         .HasKey(cd => new { cd.CustomerId, cd.OfficeId, cd.DivisionName });
    // }
}
