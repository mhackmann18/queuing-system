using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(Number), nameof(DivisionName), nameof(DivisionOfficeId))]
public class Desk
{
  public required int Number { get; set; }

  // Foreign Key
  [Column(TypeName = "varchar(50)")]
  public required string DivisionName { get; set; }

  // Foreign Key
  [Column(TypeName = "char(36)")]
  public Guid DivisionOfficeId { get; set; }

  // Dependent Navigation
  public UserAtDesk? UserAtDesk { get; set; }
}
