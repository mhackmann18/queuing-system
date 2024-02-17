
namespace CustomerApi.Models;

public class CustomerDto
{
  public Guid Id { get; set; }
  public required string FullName { get; set; }
  public DateTime CheckInTime { get; set; }

    // Dependent Navigation
  public List<CustomerDivisionDto> Divisions { get; set; } = null!;
}

public class CustomerDivisionDto
{
  public required string Name { get; set; }
  public required string Status { get; set; }
  public int? WaitingListIndex { get; set; }

  // Dependent Navigation
  public List<DateTime> TimesCalled { get; set; } = null!;
}
