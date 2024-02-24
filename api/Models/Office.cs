using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerApi.Models;

public class Office
{
  [Column(TypeName = "char(36)")]
  public required Guid OfficeId { get; set; }

  [Column(TypeName = "varchar(70)")]
  public required string OfficeName { get; set; }

  public ICollection<Division>? Divisions { get; set; }
  public ICollection<UserOffice>? Users { get; set; }
}
