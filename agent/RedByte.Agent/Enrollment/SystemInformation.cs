namespace RedByte.Agent.Enrollment;
using System;
using System.Net;
using System.Net.NetworkInformation;
using System.Linq;
using System.Net.Http;

public static class SystemInformation
{
    public static string GetHostname()
    {
        return Environment.MachineName;
    }

    public static string GetOS()
    {
        return Environment.OSVersion.ToString();
    }

    public static string GetLocalIP()
    {
        var host = Dns.GetHostEntry(Dns.GetHostName());

        foreach (var ip in host.AddressList)
        {
            if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
            {
                return ip.ToString();
            }
        }

        return "Unknown";
    }

    public static string GetMacAddress()
    {
        var interfaces = NetworkInterface.GetAllNetworkInterfaces();

        foreach (var ni in interfaces)
        {
            if (ni.OperationalStatus == OperationalStatus.Up &&
                ni.NetworkInterfaceType != NetworkInterfaceType.Loopback &&
                ni.NetworkInterfaceType != NetworkInterfaceType.Tunnel)
            {
                var bytes = ni.GetPhysicalAddress().GetAddressBytes();

                if (bytes.Length == 0)
                    continue;

                return string.Join(":", bytes.Select(b => b.ToString("X2")));
            }
        }

        return "Unknown";
    }

    public static string GetNetworkType()
    {
        var interfaces = NetworkInterface.GetAllNetworkInterfaces();
        
        foreach (var ni in interfaces)
        {
            if (ni.OperationalStatus == OperationalStatus.Up &&
                ni.NetworkInterfaceType != NetworkInterfaceType.Loopback &&
                ni.NetworkInterfaceType != NetworkInterfaceType.Tunnel)
            {
                if (ni.NetworkInterfaceType == NetworkInterfaceType.Wireless80211)
                    return "WiFi";

                if (ni.NetworkInterfaceType == NetworkInterfaceType.Ethernet)
                    return "Ethernet";
            }
        }

        return "Unknown";
    }
    
    public static string GetUsername()
    {
        return Environment.UserName;
    }
    
    public static string GetPublicIP()
    {
        try
        {
            using (var client = new HttpClient())
            {
                return client.GetStringAsync("https://api.ipify.org").Result;
            }
        }
        catch
        {
            return "Unknown";
        }
    }
}