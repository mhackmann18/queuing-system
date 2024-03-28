using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerApi.Models;

public class Company
{
    [Column(TypeName = "char(36)")]
    public required Guid Id { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string Name { get; set; }
}
