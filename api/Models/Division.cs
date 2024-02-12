using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(divisionId))]
public class Division
{
    [Column(TypeName = "char(36)")]
    public required Guid divisionId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string divisionName { get; set; }
}
