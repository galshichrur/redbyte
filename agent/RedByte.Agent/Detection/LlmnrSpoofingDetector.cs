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
                "Poisoning",
                $"{protocol} Poisoning",
                2,
                $"{protocol} activity detected from {sourceIp}. This local name-resolution protocol can be abused for spoofing in the local network.",
                sourceIp,
                false
            );
        }
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
