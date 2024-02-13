using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(
    nameof(CustomerDivisionCustomerId), 
    nameof(CustomerDivisionDivisionId), 
    nameof(TimeCalled))
]
public class CustomerDivisionTimeCalled
{
    public required DateTime TimeCalled { get; set; }

    [Column(TypeName = "char(36)")]
    public required Guid CustomerDivisionCustomerId { get; set; }
    
    [Column(TypeName = "char(36)")]
    public required Guid CustomerDivisionDivisionId { get; set; }
}
