using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerApi.Models;

public class Division
{
    [Column(TypeName = "char(36)")]
    public required Guid DivisionId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public required string DivisionName { get; set; }

    public ICollection<CustomerDivision>? Customers;
}
