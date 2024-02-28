using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

[PrimaryKey(nameof(CompanyId), nameof(OfficeId))]
public class CompanyOffice 
{
  [Column(TypeName = "char(36)")]
  public required Guid CompanyId { get; set; }
  
  [Column(TypeName = "char(36)")]
  public required Guid OfficeId { get; set; }
  
  public Company Company { get; set; } = null!;
  
  public Office Office { get; set; } = null!;
}
