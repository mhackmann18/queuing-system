using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(customerId), nameof(divisionId))]
public class CustomerDivision
{
    [Column(TypeName = "varchar(36)")]
    public required string customerId { get; set; }

    [Column(TypeName = "varchar(36)")]
    public required string divisionId { get; set; }

    public required CustomerStatus Status { get; set; }

    public int waitingListIndex { get; set; }
}
