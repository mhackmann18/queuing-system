using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(customerId))]
public class Customer
{
    [Column(TypeName = "char(36)")]
    public required Guid customerId { get; set; }

    [Column(TypeName = "varchar(100)")]
    public required string fullName { get; set; }

    public required DateTime checkInTime { get; set; }
}

public class PostedCustomer
{
    public required string fullName { get; set; }
    public required string officeId { get; set; }
    public required string[] divisions { get; set; }
};
