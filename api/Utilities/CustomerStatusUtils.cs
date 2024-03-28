using System.Text.RegularExpressions;

namespace CustomerApi.Utilities;

public static class CustomerStatusUtils
{
    private static readonly string[] _statuses = ["Served", "Waiting", "No Show",];

    public static bool IsValidStatus(string status)
    {
        if (IsDeskStatus(status) || _statuses.Contains(status))
        {
            return true;
        }

        return false;
    }

    public static bool IsDeskStatus(string status)
    {
        return Regex.IsMatch(status, @"^Desk\s\d+$");
    }
}
