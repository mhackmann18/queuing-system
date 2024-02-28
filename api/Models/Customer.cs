using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerApi.Models;

public class Customer
{
    // Primary Key
    [Column(TypeName = "char(36)")]
    public Guid Id { get; set; }

    [Column(TypeName = "varchar(100)")]
    public required string FullName { get; set; }

    public DateTime CheckInTime { get; set; }

    // Dependent Navigation
    public ICollection<CustomerDivision> Divisions { get; set; } = null!;
    public CustomerAtDesk? CustomerAtDesk { get; set; }
}
