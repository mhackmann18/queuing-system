// using System.ComponentModel;
// using Newtonsoft.Json;

// namespace CustomerApi.Models;

// public class Customer
// {
//     public required string FirstName { get; set; }

//     public required string LastName { get; set; }

//     public long Id { get; set; }

//     public DateTime CheckInTime { get; set; }

//     // public long DepartmentId { get; set;}
//     public MotorVehicle? MotorVehicle { get; set; }
//     public DriversLicense? DriversLicense { get; set; }

// }


// public class MotorVehicle
// {
//     public CustomerStatus Status { get; set; }
//     public string[]? CallTimes { get; set; }
// }

// public class DriversLicense
// {
//     public CustomerStatus Status { get; set; }
//     public string[]? CallTimes { get; set; }
// }

// public enum CustomerStatus
// {
//     // CustomerRawStatus enum values\    
//     [JsonProperty("Waiting")]

//     Waiting,
//         [JsonProperty("Served")]

//     Served,
//         [JsonProperty("Serving")]

//     Serving,
//     [Description("No Show")]
//     [JsonProperty("NoShow")]
//     NoShow
// }



using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

// namespace EFModeling.EntityProperties.FluentAPI.Required;
namespace CustomerApi.Models;


internal class MyContext : DbContext
{
    public DbSet<Division> Division { get; set; }

    public DbSet<Customer> CUSTOMER { get; set; }

    #region Required
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Division>()
            .ToTable("DIVISION", schema: "queuing_system");
        modelBuilder.Entity<Customer>()
            .ToTable("CUSTOMER", schema: "queuing_system");
        modelBuilder.Entity<CustomerDivision>()
            .ToTable("CUSTOMERDIVISION", schema: "queuing_system")
            .Property(e => e.Status)
            .HasConversion<string>();
        modelBuilder.Entity<CustomerDivisionTimeCalled>()
            .ToTable("CUSTOMERDIVISIONTIMECALLED", schema: "queuing_system");

        // .Property(b => b.Url)
        // .IsRequired();
        // Console.WriteLine( modelBuilder.Entity<Customer>());
    }
    #endregion
}

// public class BloggingContext : DbContext
// {
//     public DbSet<Customer> Customers { get; set; }
//     public DbSet<Division> Divisions { get; set; }

//     public string DbPath { get; }

//     public BloggingContext()
//     {
//         var folder = Environment.SpecialFolder.LocalApplicationData;
//         var path = Environment.GetFolderPath(folder);
//         DbPath = System.IO.Path.Join(path, "blogging.db");
//     }

//     // The following configures EF to create a Sqlite database file in the
//     // special "local" folder for your platform.
//     protected override void OnConfiguring(DbContextOptionsBuilder options)
//         => options.UseSqlite($"Data Source={DbPath}");
// }
[PrimaryKey(nameof(customerId))]
public class Customer
{
    [Column(TypeName = "varchar(36)")]
    public required string customerId { get; set; }

    [Column(TypeName = "varchar(36)")]
    public required string divisionId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string firstName { get; set; }
    [Column(TypeName = "varchar(50)")]
    public required string lastName { get; set; }

    public required DateTime checkInTime { get; set; }
}

[PrimaryKey(nameof(divisionId))]
public class Division
{
    [Column(TypeName = "varchar(36)")]
    public required string divisionId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string divisionName { get; set; }
}

[PrimaryKey(nameof(customerId), nameof(divisionId))]
public class CustomerDivision
{
    [Column(TypeName = "varchar(36)")]
    public required string customerId { get; set; }

    [Column(TypeName = "varchar(36)")]
    public required string divisionId { get; set; }

    public required CustomerStatus Status { get; set; }

    public int waitingListIndex { get; set; }
}

[PrimaryKey(nameof(customerId), nameof(divisionId), nameof(timeCalled))]
public class CustomerDivisionTimeCalled
{
    [Column(TypeName = "varchar(36)")]
    public required string customerId { get; set; }

    [Column(TypeName = "varchar(36)")]
    public required string divisionId { get; set; }

    public required DateTime timeCalled { get; set; }
}



public enum CustomerStatus
{
    // CustomerRawStatus enum values\    

    Waiting,

    Served,

    Serving,
    [Description("No Show")]
    NoShow,

    [Description("Desk 1")]
    Desk1,
    [Description("Desk 2")]
    Desk2,
    [Description("Desk 3")]
    Desk3,
    [Description("Desk 4")]
    Desk4,
    [Description("Desk 5")]
    Desk5,
    [Description("Desk 6")]
    Desk6,
    [Description("Desk 7")]
    Desk7,
    [Description("Desk 8")]
    Desk8,
    [Description("Desk 9")]
    Desk9,
    [Description("Desk 10")]
    Desk10,
}


// public class Customer
// {
//     [Key]
//     public required string CustomerId { get; set; }

//     [Required]
//     public string DivisionId { get; set; }

//     [Required]
//     [MaxLength(50)]
//     public string FirstName { get; set; }

//     [Required]
//     [MaxLength(50)]
//     public string LastName { get; set; }

//     [Required]
//     public DateTime CheckInTime { get; set; }

//     [ForeignKey("DivisionId")]
//     public Division Division { get; set; }
// }

// public class Division
// {
//     [Key]
//     public string DivisionId { get; set; }

//     [Required]
//     [MaxLength(50)]
//     public string DivisionName { get; set; }

//     public ICollection<Customer> Customers { get; set; }
// }

// public class CustomerDivision
// {
//     [ForeignKey("Customer")]
//     public string CustomerId { get; set; }

//     [ForeignKey("Division")]
//     public string DivisionId { get; set; }

//     [Required]
//     public string Status { get; set; }

//     public int WaitingListIndex { get; set; }

//     [Key]
//     [Column(Order = 1)]
//     public string CustomerId { get; set; }

//     [Key]
//     [Column(Order = 2)]
//     public string DivisionId { get; set; }
// }

// public class CustomerDivisionTimeCalled
// {
//     [ForeignKey("Customer")]
//     public string CustomerId { get; set; }

//     [ForeignKey("Division")]
//     public string DivisionId { get; set; }

//     [Key]
//     public DateTime TimeCalled { get; set; }
// }