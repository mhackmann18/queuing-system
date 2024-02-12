using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(customerId), nameof(divisionId))]
public class CustomerDivision
{
    [Column(TypeName = "char(36)")]
    public required Guid customerId { get; set; }

    [Column(TypeName = "char(36)")]
    public required Guid divisionId { get; set; }

    public required CustomerStatus Status { get; set; }

    public int waitingListIndex { get; set; }
}
