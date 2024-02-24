using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(UserId), nameof(OfficeId), nameof(DivisionName))]
public class AtDesk
{
    // Foreign Key
    [Column(TypeName = "char(36)")]
    public required Guid UserId { get; set; }

    // Foreign Key
    [Column(TypeName = "char(36)")]
    public required Guid OfficeId { get; set; }

    // Foreign Key
    [Column(TypeName = "varchar(50)")]
    public required string DivisionName { get; set; }

    public required int DeskNumber { get; set; }

    // Dependent Navigation
    public ICollection<CustomerDivision>? Customers { get; set; }
}
