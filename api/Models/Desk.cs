using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(DivisionOfficeId), nameof(DivisionName), nameof(Number))]
public class Desk
{
  public required int Number { get; set; }

  [Column(TypeName = "char(36)")]
  public required Guid DivisionId { get; set; }
  
  [Column(TypeName = "char(36)")]
  public required Guid DeskId { get; set; }

  // Foreign Key
  [Column(TypeName = "char(36)")]
  public Guid DivisionOfficeId { get; set; }

  // Foreign Key
  [Column(TypeName = "varchar(50)")]
  public required string DivisionName { get; set; }
}
