namespace CustomerApi.Utilities;

public static class DateUtils
{
    public static bool SameDay(DateTime date1, DateTime date2, string? timezone)
    {
        if (timezone != null)
        {
            var timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(timezone);
            return TimeZoneInfo.ConvertTimeFromUtc(date1, timeZoneInfo).Date
                == TimeZoneInfo.ConvertTimeFromUtc(date2, timeZoneInfo).Date;
        }
        return date1.Date == date2.Date;
    }
}
