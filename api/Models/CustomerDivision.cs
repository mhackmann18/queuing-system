using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(CustomerId), nameof(DivisionId))]
public class CustomerDivision
{
    [Column(TypeName = "char(36)")]
    public required Guid CustomerId { get; set; }

    [Column(TypeName = "char(36)")]
    public required Guid DivisionId { get; set; }

    public required CustomerStatus Status { get; set; }

    public int? WaitingListIndex { get; set; }
}
