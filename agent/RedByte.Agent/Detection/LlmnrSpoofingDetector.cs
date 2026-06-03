using System.Net;
using PacketDotNet;

namespace RedByte.Agent.Detection;

public class LlmnrSpoofingDetector : IDetector
{
    private const int LlmnrPort = 5355;

    private readonly object _lock = new object();
    private readonly HashSet<string> _reportedSources = new HashSet<string>();

    public DetectionReport? Analyze(Packet packet)
    {
        UdpPacket udp = packet.Extract<UdpPacket>();
        if (udp == null)
        {
            return null;
        }

        if (udp.SourcePort != LlmnrPort && udp.DestinationPort != LlmnrPort)
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
            if (_reportedSources.Contains(sourceIp))
            {
                return null;
            }

            _reportedSources.Add(sourceIp);

            return new DetectionReport(
                "Poisoning",
                "LLMNR Poisoning",
                2,
                $"LLMNR activity detected from {sourceIp}. This protocol can be abused for spoofing in the local network.",
                sourceIp,
                false
            );
        }
    }

    private bool ShouldIgnore(IPAddress address)
    {
        return IPAddress.IsLoopback(address) ||
               address.ToString() == "0.0.0.0" ||
               address.ToString() == "255.255.255.255";
    }
}
