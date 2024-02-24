using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(UserId))]
public class User
{
    // Foreign Key
    [Column(TypeName = "char(36)")]
    public required Guid UserId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string Username { get; set; }

    [Column(TypeName = "varchar(72)")]
    public required string Password { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string FirstName { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string LastName { get; set; }

    // Dependent Navigation
    public ICollection<CustomerDivision>? Customers { get; set; }
}
