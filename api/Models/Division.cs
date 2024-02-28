using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(Name), nameof(OfficeId))]
public class Division
{
    [Column(TypeName = "varchar(50)")]
    public required string Name { get; set; }

    public required int MaxNumberOfDesks { get; set; }

    // Foreign Key
    [Column(TypeName = "char(36)")]
    public required Guid OfficeId { get; set; }

    // Dependent Navigation
    public ICollection<CustomerDivision>? Customers { get; set; }
    public ICollection<Desk> Desks { get; set; } = null!;
}
