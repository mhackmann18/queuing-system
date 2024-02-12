using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

// namespace EFModeling.EntityProperties.FluentAPI.Required;
namespace CustomerApi.Models;

[PrimaryKey(nameof(customerId))]
public class Customer
{
    [Column(TypeName = "varchar(36)")]
    public required string customerId { get; set; }

    // [Column(TypeName = "varchar(36)")]
    // public required string divisionId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string fullName { get; set; }

    public required DateTime checkInTime { get; set; }
}

public class PostedCustomer
{
    public required string fullName { get; set; }
    public required string officeId { get; set; }
    public required string[] divisions { get; set; }

};
