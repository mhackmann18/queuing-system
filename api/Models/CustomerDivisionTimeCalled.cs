using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(
    nameof(TimeCalled),
    nameof(CustomerDivisionCustomerId), 
    nameof(CustomerDivisionDivisionName), 
    nameof(CustomerDivisionDivisionOfficeId)
)]
public class CustomerDivisionTimeCalled
{
    // Columns
    public required DateTime TimeCalled { get; set; }

    // Customer Division Foreign Keys
    [Column(TypeName = "char(36)")]
    public required Guid CustomerDivisionCustomerId { get; set; }
    [Column(TypeName = "varchar(50)")]
    public required string CustomerDivisionDivisionName { get; set; }
    [Column(TypeName = "char(36)")]
    public required Guid CustomerDivisionDivisionOfficeId { get; set; }
}
