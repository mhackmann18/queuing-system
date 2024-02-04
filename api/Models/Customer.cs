using System.ComponentModel;
using Newtonsoft.Json;

namespace TodoApi.Models;

public class Customer
{
    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public long Id { get; set; }

    public DateTime CheckInTime { get; set; }

    // public long DepartmentId { get; set;}
    public MotorVehicle? MotorVehicle { get; set; }
    public DriversLicense? DriversLicense { get; set; }

}

public class MotorVehicle
{
    public CustomerStatus Status { get; set; }
    public string[]? CallTimes { get; set; }
}

public class DriversLicense
{
    public CustomerStatus Status { get; set; }
    public string[]? CallTimes { get; set; }
}

public enum CustomerStatus
{
    // CustomerRawStatus enum values\    
    [JsonProperty("Waiting")]

    Waiting,
        [JsonProperty("Served")]

    Served,
        [JsonProperty("Serving")]

    Serving,
    [Description("No Show")]
    [JsonProperty("NoShow")]
    NoShow
}

