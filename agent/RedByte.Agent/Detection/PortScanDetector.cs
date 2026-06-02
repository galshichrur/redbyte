using System.Net;
using PacketDotNet;

namespace RedByte.Agent.Detection;

public class PortScanDetector : IDetector
{
    private const int PortThreshold = 20;
    private static readonly TimeSpan TimeWindow = TimeSpan.FromSeconds(30);

    private readonly object _lock = new object();
    private readonly Dictionary<string, PortScanState> _sources = new Dictionary<string, PortScanState>();

    public DetectionReport? Analyze(Packet packet)
    {
        IPPacket ipPacket = packet.Extract<IPPacket>();
        if (ipPacket == null)
        {
            return null;
        }

        int? destinationPort = GetDestinationPort(packet);
        if (destinationPort == null)
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
            DateTime now = DateTime.UtcNow;

            if (!_sources.ContainsKey(sourceIp))
            {
                _sources[sourceIp] = new PortScanState();
            }

            PortScanState state = _sources[sourceIp];
            RemoveOldPorts(state, now);

            state.Ports[destinationPort.Value] = now;

            if (state.IsBlocked || state.Ports.Count < PortThreshold)
            {
                return null;
            }

            state.IsBlocked = true;

            return new DetectionReport(
                "Reconnaissance",
                "Port Scan",
                3,
                $"Port scanning detected. Source {sourceIp} accessed {state.Ports.Count} ports in {TimeWindow.TotalSeconds} seconds.",
                sourceIp,
                true,
                true
            );
        }
    }

    private int? GetDestinationPort(Packet packet)
    {
        TcpPacket tcp = packet.Extract<TcpPacket>();
        if (tcp != null)
        {
            return tcp.DestinationPort;
        }

        UdpPacket udp = packet.Extract<UdpPacket>();
        if (udp != null)
        {
            return udp.DestinationPort;
        }

        return null;
    }

    private void RemoveOldPorts(PortScanState state, DateTime now)
    {
        List<int> oldPorts = new List<int>();

        foreach (KeyValuePair<int, DateTime> port in state.Ports)
        {
            if (now - port.Value > TimeWindow)
            {
                oldPorts.Add(port.Key);
            }
        }

        foreach (int port in oldPorts)
        {
            state.Ports.Remove(port);
        }
    }

    private bool ShouldIgnore(IPAddress address)
    {
        return IPAddress.IsLoopback(address) ||
               address.ToString() == "0.0.0.0" ||
               address.ToString() == "255.255.255.255";
    }

    private class PortScanState
    {
        public Dictionary<int, DateTime> Ports { get; } = new Dictionary<int, DateTime>();
        public bool IsBlocked { get; set; }
    }
}
