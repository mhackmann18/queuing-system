using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(CustomerId), nameof(DivisionId), nameof(TimeCalled))]
public class CustomerDivisionTimeCalled
{
    [Column(TypeName = "char(36)")]
    public required Guid CustomerId { get; set; }

    [Column(TypeName = "char(36)")]
    public required Guid DivisionId { get; set; }

    public required DateTime TimeCalled { get; set; }
}
