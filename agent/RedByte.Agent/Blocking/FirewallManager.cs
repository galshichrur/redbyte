using System.Diagnostics;

namespace RedByte.Agent.Blocking;

public static class FirewallManager
{
    public static bool BlockIpAddress(string ipAddress)
    {
        try
        {
            string ruleName = $"RedByte_Block_{ipAddress}";

            string argsIn =
                $"advfirewall firewall add rule name=\"{ruleName}\" dir=in action=block remoteip={ipAddress}";
            ExecuteCommand(argsIn);

            string argsOut =
                $"advfirewall firewall add rule name=\"{ruleName}\" dir=out action=block remoteip={ipAddress}";
            ExecuteCommand(argsOut);
            return true;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public static bool UnblockIpAddress(string ipAddress)
    {
        try
        {
            string ruleName = $"RedByte_Block_{ipAddress}";

            string args = $"advfirewall firewall delete rule name=\"{ruleName}\"";
            ExecuteCommand(args);
            return true;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    private static void ExecuteCommand(string arguments)
    {
        ProcessStartInfo startInfo = new ProcessStartInfo
        {
            FileName = "netsh",
            Arguments = arguments,
            CreateNoWindow = true,
            UseShellExecute = false
        };

        using (Process process = Process.Start(startInfo))
        {
            process?.WaitForExit();
        }
    }
}