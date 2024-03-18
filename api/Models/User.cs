using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

public class User
{
    // Foreign Key
    [Column(TypeName = "varchar(36)")]
    public required string Id { get; set; }

    // Dependent Navigation
    public UserAtDesk? Desk { get; set; }

    public ICollection<UserOffice> Offices { get; set; } = null!;
}
