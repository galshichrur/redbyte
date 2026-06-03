using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
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
    private readonly HashSet<string> _reportedAttacks = new HashSet<string>();

    public ArpPoisoningDetector()
    {
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
                _trustedMappings[ip] = macAddress;
                return null;
            }

            PhysicalAddress trustedMacAddress = _trustedMappings[ip];
            if (SameMac(trustedMacAddress, macAddress))
            {
                return null;
            }

            ArpDefender.RestoreMapping(ipAddress, trustedMacAddress);

            string attackKey = $"{ip}:{mac}";
            if (_reportedAttacks.Contains(attackKey))
            {
                return null;
            }

            _reportedAttacks.Add(attackKey);

            string trustedMac = FormatMac(trustedMacAddress);
            return new DetectionReport(
                "Poisoning",
                "ARP Poisoning",
                3,
                $"ARP Spoofing detected. Known IP {ip} changed from {trustedMac} to {mac}.",
                ip,
                false
            );
        }
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
}
