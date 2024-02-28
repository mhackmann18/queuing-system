using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(CustomerId), nameof(DeskNumber), nameof(DeskOfficeId), nameof(DeskDivisionName))]
public class CustomerAtDesk 
{
  // Foreign Key
  [Column(TypeName = "char(36)")]
  public required Guid CustomerId { get; set; }
  
  // Foreign Key
  public required int DeskNumber { get; set; }
  
  // Foreign Key
  [Column(TypeName = "char(36)")]
  public required Guid DeskOfficeId { get; set; }
  
  // Foreign Key
  [Column(TypeName = "varchar(50)")]
  public required string DeskDivisionName { get; set; }
}
