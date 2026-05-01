namespace RedByte.Agent.Models;

public class AlertMessage
{
    public string timestamp { get; }
    public string alert_type { get; set; }
    public string alert_name { get; set; }
    public int severity { get; set; }
    public string description { get; set; }
    public bool is_blocked { get; set; }
    public string suspected_address { get; set; }

    public AlertMessage(string type, string name, int severity, string description, bool isBlocked, string suspectedAddress)
    {
        timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
        this.alert_type = type;
        this.alert_name = name;
        this.severity = severity;
        this.description = description;
        this.is_blocked = isBlocked;
        this.suspected_address = suspectedAddress;
    }
}