using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerApi.Models;

public class CompanyOffice 
{
  [Column(TypeName = "char(36)")]
  public required Guid CompanyId { get; set; }
  
  [Column(TypeName = "char(36)")]
  public required Guid OfficeId { get; set; }
  
  public Company Company { get; set; } = null!;
  
  public Office Office { get; set; } = null!;
}
