namespace RedByte.Agent.Models;

public class AlertMessage
{
    public string type { get; set; }
    public string event_type { get; set; }
    public string name { get; set; }
    public int severity { get; set; }
    public string description { get; set; }
    public bool is_blocked { get; set; }
    public string suspected_ip { get; set; }
    public string detected_at { get; }

    public AlertMessage(string eventType, string name, int severity, string description, bool isBlocked, string suspectedIp)
    {
        this.type = "ALERT";
        this.event_type = eventType;
        this.name = name;
        this.severity = severity;
        this.description = description;
        this.is_blocked = isBlocked;
        this.suspected_ip = suspectedIp;
        this.detected_at = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
    }
}
