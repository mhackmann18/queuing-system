using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(customerId), nameof(divisionId), nameof(timeCalled))]
public class CustomerDivisionTimeCalled
{
    [Column(TypeName = "varchar(36)")]
    public required string customerId { get; set; }

    [Column(TypeName = "varchar(36)")]
    public required string divisionId { get; set; }

    public required DateTime timeCalled { get; set; }
}
