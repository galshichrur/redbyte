using Microsoft.Win32;

namespace RedByte.Agent.SystemUtils;

public class Startup
{
    public static void SetStartup()
    {
        const string RunKey = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Run";
        using (RegistryKey key = Registry.LocalMachine.OpenSubKey(RunKey, true))
        {
            string path = Environment.ProcessPath; 
            key.SetValue("RedByteAgent", $"\"{path}\"");
        }
    }
}