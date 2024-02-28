using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(CustomerId), nameof(DivisionName), nameof(DivisionOfficeId))]
public class CustomerDivision
{
    // Foreign Keys
    [Column(TypeName = "char(36)")]
    public Guid CustomerId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string DivisionName { get; set; }

    [Column(TypeName = "char(36)")]
    public Guid DivisionOfficeId { get; set; }

    // Columns
    public required string Status { get; set; }
    public int? WaitingListIndex { get; set; }

    // Navigation
    public Division Division { get; set; } = null!;
    public ICollection<CustomerDivisionTimeCalled> TimesCalled { get; set; } = null!;
}
