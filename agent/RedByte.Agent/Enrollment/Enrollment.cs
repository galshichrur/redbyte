namespace RedByte.Agent.Enrollment;
using System;
using Microsoft.Win32;

public class Enrollment
{
    const string RegistryPath = @"SOFTWARE\RedByte\Agent";
    
    // Validate the given enrollment token.
    public bool ValidateEnrollmentToken(string token)
    {
        
    }
    
    // Validate the stored agent credentials with the server.
    public bool ValidateCredentials(AgentCredentials credentials)
    {
        
    }
    
    // Checks if the registry contains the agent credentials, if true returns them, else returns null
    private static AgentCredentials? GetCredentials()
    {
        // Open the HKLM key in read only mode
        using (RegistryKey key = Registry.LocalMachine.OpenSubKey(RegistryPath))
        {
            if (key == null)
            {
                return null;
            }

            string agentId = key.GetValue("AgentId") as string;
            string agentSecret = key.GetValue("AgentSecret") as string;

            if (!string.IsNullOrEmpty(agentId) && !string.IsNullOrEmpty(agentSecret))
            {
                return new AgentCredentials
                {
                    AgentId = agentId,
                    AgentSecret = agentSecret
                };
            }

            return null;
        }
    }
    
    // Store the given credentials in registry.
    private static bool StoreCredentials(string agentId, string agentSecret)
    {
        try
        {
            using (RegistryKey key = Registry.LocalMachine.CreateSubKey(RegistryPath))
            {
                if (key == null) return false;

                key.SetValue("AgentId", agentId, RegistryValueKind.String);
                key.SetValue("AgentSecret", agentSecret, RegistryValueKind.String);
            
                return true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return false;
        }
    }
}