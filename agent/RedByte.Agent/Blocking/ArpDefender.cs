using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;

namespace RedByte.Agent.Blocking;

public static class ArpDefender
{
    public static bool RestoreMapping(IPAddress ipAddress, PhysicalAddress macAddress)
    {
        try
        {
            string ip = ipAddress.ToString();
            string mac = FormatMac(macAddress);

            ExecuteCommand($"-d {ip}");
            return ExecuteCommand($"-s {ip} {mac}");
        }
        catch
        {
            return false;
        }
    }

    private static string FormatMac(PhysicalAddress macAddress)
    {
        return BitConverter.ToString(macAddress.GetAddressBytes());
    }

    private static bool ExecuteCommand(string arguments)
    {
        ProcessStartInfo startInfo = new ProcessStartInfo
        {
            FileName = "arp",
            Arguments = arguments,
            CreateNoWindow = true,
            UseShellExecute = false
        };

        Process? process = Process.Start(startInfo);
        if (process == null)
        {
            return false;
        }

        process.WaitForExit();
        bool success = process.ExitCode == 0;
        process.Dispose();
        return success;
    }
}
