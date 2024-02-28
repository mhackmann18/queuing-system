using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerApi.Models;

public class UserAtDesk
{
  // Foreign Key
  [Column(TypeName = "char(36)")]
  public required Guid UserId { get; set; }
  
  // Foreign Key
  [Column(TypeName = "char(36)")]
  public required Guid DeskNumber { get; set; }
  
  // Foreign Key
  [Column(TypeName = "char(36)")]
  public required Guid DeskOfficeId { get; set; }
  
  // Foreign Key
  [Column(TypeName = "varchar(50)")]
  public required string DeskDivisionName { get; set; }
}
