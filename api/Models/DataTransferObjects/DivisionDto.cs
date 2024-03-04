namespace CustomerApi.Models;

public class DivisionDto
{
  public required string Name { get; set; }
  public required int NumberOfDesks { get; set; }
  public required List<int> OccupiedDeskNumbers { get; set; }
}
