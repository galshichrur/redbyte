using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using PacketDotNet;

namespace RedByte.Agent.Detection;

public class LlmnrSpoofingDetector : IDetector
{
    private const int LlmnrPort = 5355;
    private const int NetBiosNameServicePort = 137;
    private const int NetBiosDatagramPort = 138;

    private readonly object _lock = new object();
    private readonly HashSet<string> _reportedSources = new HashSet<string>();
    private readonly HashSet<string> _localAddresses;

    public LlmnrSpoofingDetector()
    {
        _localAddresses = LoadLocalIPv4Addresses();
    }

    public DetectionReport? Analyze(Packet packet)
    {
        UdpPacket udp = packet.Extract<UdpPacket>();
        if (udp == null)
        {
            return null;
        }

        string? protocol = GetNameResolutionProtocol(udp);
        if (protocol == null)
        {
            return null;
        }

        IPPacket ipPacket = packet.Extract<IPPacket>();
        if (ipPacket == null)
        {
            return null;
        }

        IPAddress sourceAddress = ipPacket.SourceAddress;
        if (ShouldIgnore(sourceAddress))
        {
            return null;
        }

        lock (_lock)
        {
            string sourceIp = sourceAddress.ToString();
            string reportKey = $"{protocol}:{sourceIp}";
            if (_reportedSources.Contains(reportKey))
            {
                return null;
            }

            _reportedSources.Add(reportKey);

            return new DetectionReport(
                "Name Spoofing",
                GetAlertName(protocol),
                4,
                GetDescription(protocol, sourceIp),
                sourceIp,
                false
            );
        }
    }

    private string GetAlertName(string protocol)
    {
        if (protocol == "LLMNR")
        {
            return "LLMNR Spoofing Attempt";
        }

        return "NetBIOS Spoofing Attempt";
    }

    private string GetDescription(string protocol, string sourceIp)
    {
        if (protocol == "LLMNR")
        {
            return $"Possible LLMNR spoofing from {sourceIp}. This is local Windows name lookup traffic. Attackers can answer these lookups to send a computer to the wrong device or collect login data. RedByte reported it but did not block it automatically because some networks still use LLMNR.";
        }

        return $"Possible NetBIOS spoofing from {sourceIp}. This is older Windows name traffic on the local network. Attackers can abuse it to pretend to be another computer. RedByte reported it but did not block it automatically because some networks still need NetBIOS.";
    }

    private string? GetNameResolutionProtocol(UdpPacket udp)
    {
        if (udp.SourcePort == LlmnrPort || udp.DestinationPort == LlmnrPort)
        {
            return "LLMNR";
        }

        if (udp.SourcePort == NetBiosNameServicePort || udp.DestinationPort == NetBiosNameServicePort)
        {
            return "NetBIOS Name Service";
        }

        if (udp.SourcePort == NetBiosDatagramPort || udp.DestinationPort == NetBiosDatagramPort)
        {
            return "NetBIOS Datagram";
        }

        return null;
    }

    private bool ShouldIgnore(IPAddress address)
    {
        return IPAddress.IsLoopback(address) ||
               _localAddresses.Contains(address.ToString()) ||
               address.ToString() == "0.0.0.0" ||
               address.ToString() == "255.255.255.255";
    }

    private HashSet<string> LoadLocalIPv4Addresses()
    {
        HashSet<string> addresses = new HashSet<string>();

        foreach (NetworkInterface networkInterface in NetworkInterface.GetAllNetworkInterfaces())
        {
            if (networkInterface.OperationalStatus != OperationalStatus.Up ||
                networkInterface.NetworkInterfaceType == NetworkInterfaceType.Loopback ||
                networkInterface.NetworkInterfaceType == NetworkInterfaceType.Tunnel)
            {
                continue;
            }

            foreach (UnicastIPAddressInformation address in networkInterface.GetIPProperties().UnicastAddresses)
            {
                if (address.Address.AddressFamily == AddressFamily.InterNetwork)
                {
                    addresses.Add(address.Address.ToString());
                }
            }
        }

        return addresses;
    }
}
