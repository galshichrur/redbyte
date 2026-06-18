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
    private readonly HashSet<string> _localAddresses;

    public ArpPoisoningDetector()
    {
        _localAddresses = LoadLocalIPv4Addresses();
        LoadDefaultGateways();
        PrimeGatewayArpCache();
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
        IPAddress targetAddress = arp.TargetProtocolAddress;
        PhysicalAddress macAddress = arp.SenderHardwareAddress;

        if (IsEmptyAddress(ipAddress) || IsEmptyMac(macAddress))
        {
            return null;
        }

        lock (_lock)
        {
            string ip = ipAddress.ToString();
            string targetIp = targetAddress.ToString();
            string mac = FormatMac(macAddress);

            if (!IsRelevantArp(ip, targetIp))
            {
                return null;
            }

            if (!_trustedMappings.ContainsKey(ip))
            {
                if (IsSuspiciousGatewayReply(arp, ip))
                {
                    return CreateReport(
                        ip,
                        mac,
                        $"Possible ARP spoofing from {ip}. This packet says the gateway IP is using MAC {mac}, but the agent did not have a trusted gateway MAC yet. RedByte reported it so you can check this device before trusting it."
                    );
                }

                string? existingIpForMac = FindDifferentIpForMac(ip, macAddress);
                if (existingIpForMac != null)
                {
                    return CreateReport(
                        ip,
                        mac,
                        $"Possible ARP spoofing from {ip}. MAC {mac} is claiming this IP, but the same MAC was already seen using {existingIpForMac}. That can mean one device is pretending to be another device on the local network."
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
                $"ARP spoofing detected for {ip}. This IP was known as MAC {trustedMac}, but now traffic says it is MAC {mac}. RedByte restored the old ARP entry so this computer keeps using the trusted address."
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
            "Local Spoofing",
            "ARP Spoofing Attempt",
            5,
            description,
            ip,
            false
        );
    }

    private bool IsSuspiciousGatewayReply(ArpPacket arp, string ip)
    {
        return arp.Operation == ArpOperation.Response && _gatewayAddresses.Contains(ip);
    }

    private bool IsRelevantArp(string senderIp, string targetIp)
    {
        return _localAddresses.Contains(senderIp) ||
               _localAddresses.Contains(targetIp) ||
               _gatewayAddresses.Contains(senderIp) ||
               _gatewayAddresses.Contains(targetIp);
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

    private void PrimeGatewayArpCache()
    {
        foreach (string gateway in _gatewayAddresses)
        {
            try
            {
                using Ping ping = new Ping();
                ping.Send(gateway, 1000);
            }
            catch
            {
            }
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
