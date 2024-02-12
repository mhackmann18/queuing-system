using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(customerId), nameof(divisionId), nameof(timeCalled))]
public class CustomerDivisionTimeCalled
{
    [Column(TypeName = "char(36)")]
    public required Guid customerId { get; set; }

    [Column(TypeName = "char(36)")]
    public required Guid divisionId { get; set; }

    public required DateTime timeCalled { get; set; }
}
