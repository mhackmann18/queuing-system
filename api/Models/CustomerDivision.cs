using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace CustomerApi.Models;

[PrimaryKey(nameof(CustomerId), nameof(DivisionName), nameof(OfficeId))]
public class CustomerDivision
{
    // Foreign Key
    [JsonIgnore] 
    [Column(TypeName = "char(36)")]
    public Guid CustomerId { get; set; }

    // Foreign Key
    [JsonIgnore]
    [Column(TypeName = "char(36)")]
    public Guid OfficeId { get; set; }

    // Foreign Key
    [Column(TypeName = "varchar(50)")]
    public required string DivisionName { get; set; }

    public required string Status { get; set; }
    public int? WaitingListIndex { get; set; }

    // Dependent Navigation
    public ICollection<CustomerDivisionTimeCalled> TimesCalled { get; set; } = null!;
}
