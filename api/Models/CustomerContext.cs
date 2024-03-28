using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

public class CustomerContext(DbContextOptions<CustomerContext> options) : DbContext(options)
{
    public DbSet<Company> Company { get; set; } = null!;
    public DbSet<CompanyOffice> CompanyOffice { get; set; } = null!;
    public DbSet<Customer> Customer { get; set; } = null!;
    public DbSet<CustomerAtDesk> CustomerAtDesk { get; set; } = null!;
    public DbSet<CustomerDivision> CustomerDivision { get; set; } = null!;
    public DbSet<CustomerDivisionTimeCalled> CustomerDivisionTimeCalled { get; set; } = null!;
    public DbSet<Desk> Desk { get; set; } = null!;
    public DbSet<Division> Division { get; set; } = null!;
    public DbSet<Office> Office { get; set; } = null!;
    public DbSet<User> User { get; set; } = null!;
    public DbSet<UserAtDesk> UserAtDesk { get; set; } = null!;
    public DbSet<UserOffice> UserOffice { get; set; } = null!;

    // If this method gets too big, see 'grouping configuration'
    // in https://learn.microsoft.com/en-us/ef/core/modeling/
    // protected override void OnModelCreating(ModelBuilder modelBuilder)
    // {
    //     // Fluent API
    //     modelBuilder.Entity<CustomerDivision>()
    //         .HasKey(cd => new { cd.CustomerId, cd.OfficeId, cd.DivisionName });
    // }
}
