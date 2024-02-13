using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace CustomerApi.Models;

[PrimaryKey(nameof(CustomerId), nameof(DivisionId))]
public class CustomerDivision
{
    [JsonIgnore]
    [Column(TypeName = "char(36)")]
    public Guid CustomerId { get; set; }

    [Column(TypeName = "char(36)")]
    public required Guid DivisionId { get; set; }

    public required string Status { get; set; }

    public int? WaitingListIndex { get; set; }

    // Dependent Navigation
    public ICollection<CustomerDivisionTimeCalled> TimesCalled { get; set; } = null!;
}
