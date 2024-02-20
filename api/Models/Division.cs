using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(OfficeId), nameof(DivisionName))]
public class Division
{
    // Foreign Key
    [Column(TypeName = "char(36)")]
    public required Guid OfficeId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string DivisionName { get; set; }
    public required int NumDesks { get; set; }

    // Dependent Navigation
    public ICollection<CustomerDivision>? Customers { get; set; }
}
