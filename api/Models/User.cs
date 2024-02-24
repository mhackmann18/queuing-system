using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

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
    public AtDesk? Desk { get; set; }

    public ICollection<UserOffice> Offices { get; set; } = null!;
}
