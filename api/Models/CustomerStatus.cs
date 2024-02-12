using System.ComponentModel;

namespace CustomerApi.Models;

public enum CustomerStatus
{
    // CustomerRawStatus enum values    

    Waiting,

    Served,

    Serving,

    [Description("No Show")]
    NoShow,

    [Description("Desk 1")]
    Desk1,
    [Description("Desk 2")]
    Desk2,
    [Description("Desk 3")]
    Desk3,
    [Description("Desk 4")]
    Desk4,
    [Description("Desk 5")]
    Desk5,
    [Description("Desk 6")]
    Desk6,
    [Description("Desk 7")]
    Desk7,
    [Description("Desk 8")]
    Desk8,
    [Description("Desk 9")]
    Desk9,
    [Description("Desk 10")]
    Desk10,
}
