using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(UserId), nameof(OfficeId))]
public class UserOffice
{
    // Foreign Key
    [Column(TypeName = "char(36)")]
    public required Guid UserId { get; set; }

    // Foreign Key
    [Column(TypeName = "char(36)")]
    public required Guid OfficeId { get; set; }


    // Dependent Navigation
    // public ICollection<CustomerDivision>? Customers { get; set; }
    // public User User { get; set; } = null!;
}
