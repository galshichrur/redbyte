using RedByte.Agent.Enrollment;
namespace RedByte.Agent.Network;

public class AuthSendMessage
{
    public string type { get; set; }
    public string agent_id { get; set; }
    public string agent_secret { get; set; }
    public string token { get; set; }
    public string hostname { get; set; }
    public string os { get; set; }
    public string local_ip { get; set; }
    public string public_ip { get; set; }
    public string mac { get; set; }
    public string network_type { get; set; }
    public string username { get; set; }

    public AuthSendMessage(string agentId, string agentSecret)
    {
        this.agent_id = agentId;
        this.agent_secret = agentSecret;
        this.type = "AUTH";
        this.hostname = SystemInformation.GetHostname();
        this.os = SystemInformation.GetOS();
        this.local_ip = SystemInformation.GetLocalIP();
        this.public_ip = SystemInformation.GetPublicIP();
        this.mac = SystemInformation.GetMacAddress();
        this.network_type = SystemInformation.GetNetworkType();
        this.username = SystemInformation.GetUsername();
    }
}

public class AuthResponseMessage
{
    public string type { get; set; }
    public bool status { get; set; }
}