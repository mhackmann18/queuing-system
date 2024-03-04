namespace CustomerApi.Models;

public class OfficeDto
{
  public required Guid Id { get; set; }
  public required string Name { get; set; }
  public required List<string> DivisionNames { get; set; }
}
