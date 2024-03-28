using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(
    nameof(CustomerId),
    nameof(DeskNumber),
    nameof(DeskDivisionName),
    nameof(DeskDivisionOfficeId)
)]
public class CustomerAtDesk
{
    // Customer Foreign Key
    [Column(TypeName = "char(36)")]
    public required Guid CustomerId { get; set; }

    // Desk Foreign Keys
    public required int DeskNumber { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string DeskDivisionName { get; set; }

    [Column(TypeName = "char(36)")]
    public required Guid DeskDivisionOfficeId { get; set; }
}
