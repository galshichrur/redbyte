using RedByte.Agent.Enrollment;

namespace RedByte.Agent.Network;

public class EnrollSendMessage
{
    public string type;
    public string token;
    public string hostname;
    public string os;
    public string local_ip;
    public string public_ip;
    public string mac;
    public string network_type;
    public string username;

    public EnrollSendMessage(string token)
    {
        this.token = token;
        this.type = "ENROLL";
        this.hostname = SystemInformation.GetHostname();
        this.os = SystemInformation.GetOS();
        this.local_ip = SystemInformation.GetLocalIP();
        this.public_ip = SystemInformation.GetPublicIP();
        this.mac = SystemInformation.GetMacAddress();
        this.network_type = SystemInformation.GetNetworkType();
        this.username = SystemInformation.GetUsername();
    }
}

public class EnrollResponseMessage
{
    public string type;
    public bool status;
    public string agent_id;
    public string agent_secret;
}
