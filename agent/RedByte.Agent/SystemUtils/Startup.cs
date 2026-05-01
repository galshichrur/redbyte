using System.Diagnostics;

namespace RedByte.Agent.SystemUtils;

public class Startup
{
    // Create scheduled task using schtasks.exe for startup with windows in the administrative privileges
    public static void SetStartup()
    {
        try
        {
            string path = Environment.ProcessPath;
            
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                FileName = "schtasks.exe",
                Arguments = $"/create /tn \"RedByteAgent\" /tr \"\\\"{path}\\\"\" /sc onlogon /rl highest /f",
                UseShellExecute = false,
                CreateNoWindow = true
            };
            
            using Process process = Process.Start(startInfo);
            process?.WaitForExit();
        }
        catch (Exception)
        {
            throw new Exception($"Failed to set startup task.");
        }
    }
}