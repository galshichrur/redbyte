using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using PacketDotNet;
using RedByte.Agent.Blocking;

namespace RedByte.Agent.Detection;

public class ArpPoisoningDetector : IDetector
{
    private static readonly Regex ArpEntryPattern = new Regex(
        @"^\s*(?<ip>(?:\d{1,3}\.){3}\d{1,3})\s+(?<mac>(?:[0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2})\s+",
        RegexOptions.Compiled);

    private readonly object _lock = new object();
    private readonly Dictionary<string, PhysicalAddress> _trustedMappings = new Dictionary<string, PhysicalAddress>();
    private readonly HashSet<string> _gatewayAddresses = new HashSet<string>();
    private readonly HashSet<string> _reportedAttacks = new HashSet<string>();

    public ArpPoisoningDetector()
    {
        LoadDefaultGateways();
        LoadCurrentArpCache();
    }

    public DetectionReport? Analyze(Packet packet)
    {
        ArpPacket arp = packet.Extract<ArpPacket>();
        if (arp == null)
        {
            return null;
        }

        IPAddress ipAddress = arp.SenderProtocolAddress;
        PhysicalAddress macAddress = arp.SenderHardwareAddress;

        if (IsEmptyAddress(ipAddress) || IsEmptyMac(macAddress))
        {
            return null;
        }

        lock (_lock)
        {
            string ip = ipAddress.ToString();
            string mac = FormatMac(macAddress);

            if (!_trustedMappings.ContainsKey(ip))
            {
                if (IsSuspiciousGatewayReply(arp, ip))
                {
                    return CreateReport(
                        ip,
                        mac,
                        $"Suspicious ARP reply detected. Gateway IP {ip} was announced by MAC {mac}, but no trusted gateway MAC was loaded yet."
                    );
                }

                string? existingIpForMac = FindDifferentIpForMac(ip, macAddress);
                if (existingIpForMac != null)
                {
                    return CreateReport(
                        ip,
                        mac,
                        $"Suspicious ARP mapping detected. MAC {mac} is now claiming IP {ip} and was already seen for IP {existingIpForMac}."
                    );
                }

                _trustedMappings[ip] = macAddress;
                return null;
            }

            PhysicalAddress trustedMacAddress = _trustedMappings[ip];
            if (SameMac(trustedMacAddress, macAddress))
            {
                return null;
            }

            ArpDefender.RestoreMapping(ipAddress, trustedMacAddress);

            string trustedMac = FormatMac(trustedMacAddress);
            return CreateReport(
                ip,
                mac,
                $"ARP Spoofing detected. Known IP {ip} changed from {trustedMac} to {mac}."
            );
        }
    }

    private DetectionReport? CreateReport(string ip, string mac, string description)
    {
        string attackKey = $"{ip}:{mac}";
        if (_reportedAttacks.Contains(attackKey))
        {
            return null;
        }

        _reportedAttacks.Add(attackKey);

        return new DetectionReport(
            "Poisoning",
            "ARP Poisoning",
            3,
            description,
            ip,
            false
        );
    }

    private bool IsSuspiciousGatewayReply(ArpPacket arp, string ip)
    {
        return arp.Operation == ArpOperation.Response && _gatewayAddresses.Contains(ip);
    }

    private string? FindDifferentIpForMac(string currentIp, PhysicalAddress macAddress)
    {
        foreach (KeyValuePair<string, PhysicalAddress> mapping in _trustedMappings)
        {
            if (mapping.Key != currentIp && SameMac(mapping.Value, macAddress))
            {
                return mapping.Key;
            }
        }

        return null;
    }

    private bool SameMac(PhysicalAddress first, PhysicalAddress second)
    {
        return first.GetAddressBytes().SequenceEqual(second.GetAddressBytes());
    }

    private bool IsEmptyAddress(IPAddress ipAddress)
    {
        return ipAddress.ToString() == "0.0.0.0";
    }

    private bool IsEmptyMac(PhysicalAddress macAddress)
    {
        return macAddress.GetAddressBytes().All(value => value == 0);
    }

    private string FormatMac(PhysicalAddress macAddress)
    {
        return BitConverter.ToString(macAddress.GetAddressBytes());
    }

    private void LoadCurrentArpCache()
    {
        try
        {
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                FileName = "arp",
                Arguments = "-a",
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardOutput = true
            };

            using Process? process = Process.Start(startInfo);
            if (process == null)
            {
                return;
            }

            string output = process.StandardOutput.ReadToEnd();
            process.WaitForExit();

            foreach (string line in output.Split(Environment.NewLine))
            {
                Match match = ArpEntryPattern.Match(line);
                if (!match.Success)
                {
                    continue;
                }

                IPAddress ipAddress = IPAddress.Parse(match.Groups["ip"].Value);
                PhysicalAddress macAddress = PhysicalAddress.Parse(
                    match.Groups["mac"].Value.Replace("-", "").Replace(":", ""));

                if (!IsEmptyAddress(ipAddress) && !IsEmptyMac(macAddress))
                {
                    _trustedMappings[ipAddress.ToString()] = macAddress;
                }
            }
        }
        catch
        {
        }
    }

    private void LoadDefaultGateways()
    {
        foreach (NetworkInterface networkInterface in NetworkInterface.GetAllNetworkInterfaces())
        {
            if (networkInterface.OperationalStatus != OperationalStatus.Up ||
                networkInterface.NetworkInterfaceType == NetworkInterfaceType.Loopback ||
                networkInterface.NetworkInterfaceType == NetworkInterfaceType.Tunnel)
            {
                continue;
            }

            foreach (GatewayIPAddressInformation gateway in networkInterface.GetIPProperties().GatewayAddresses)
            {
                if (gateway.Address.AddressFamily == AddressFamily.InterNetwork && !IsEmptyAddress(gateway.Address))
                {
                    _gatewayAddresses.Add(gateway.Address.ToString());
                }
            }
        }
    }
}
