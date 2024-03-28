using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerApi.Models;

public class Office
{
    [Column(TypeName = "char(36)")]
    public required Guid Id { get; set; }

    [Column(TypeName = "varchar(70)")]
    public required string Name { get; set; }

    [Column(TypeName = "varchar(32)")]
    public required string Timezone { get; set; }

    public ICollection<Division>? Divisions { get; set; }
    public ICollection<UserOffice>? Users { get; set; }
}
