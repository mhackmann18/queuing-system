using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(UserId), nameof(DeskNumber), nameof(DeskDivisionName), nameof(DeskDivisionOfficeId))]
public class UserAtDesk
{
  public required DateTime SessionEndTime { get; set; }
  
  // Foreign Key
  [Column(TypeName = "varchar(36)")]
  public required string UserId { get; set; }
  
  // Foreign Key
  public required int DeskNumber { get; set; }
  
  // Foreign Key
  [Column(TypeName = "varchar(50)")]
  public required string DeskDivisionName { get; set; }
  
  // Foreign Key
  [Column(TypeName = "char(36)")]
  public required Guid DeskDivisionOfficeId { get; set; }
}
