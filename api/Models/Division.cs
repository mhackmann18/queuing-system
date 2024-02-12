using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(divisionId))]
public class Division
{
    [Column(TypeName = "varchar(36)")]
    public required string divisionId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string divisionName { get; set; }
}
