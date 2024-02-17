using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(
    nameof(CustomerId), 
    nameof(DivisionName), 
    nameof(OfficeId),
    nameof(TimeCalled)
)]
public class CustomerDivisionTimeCalled
{
    public required DateTime TimeCalled { get; set; }

    // FK
    [Column(TypeName = "char(36)")]
    public required Guid CustomerId { get; set; }

    // FK
    [Column(TypeName = "char(36)")]
    public required Guid OfficeId { get; set; }

    // FK
    [Column(TypeName = "varchar(50)")]
    public required string DivisionName { get; set; }
}
