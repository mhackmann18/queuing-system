using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CustomerApi.Models;

public class Customer
{
    [Column(TypeName = "char(36)")]
    public required Guid CustomerId { get; set; }

    [Column(TypeName = "varchar(100)")]
    public required string FullName { get; set; }

    public required DateTime CheckInTime { get; set; }
}
