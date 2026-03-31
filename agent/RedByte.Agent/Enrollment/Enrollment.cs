using RedByte.Agent.Network;

namespace RedByte.Agent.Enrollment;
using System;
using Microsoft.Win32;

public static class Enrollment
{
    const string RegistryPath = @"SOFTWARE\RedByte\Agent";
    
    // Validate the given enrollment token.
    public static async Task<bool> ValidateEnrollmentToken(string token)
    {
        EnrollSendMessage request = new EnrollSendMessage(token);

        TcpClientManager client = TcpClientManager.GetInstance();

        bool connected = await client.Connect();
        if (!connected)
            throw new Exception("Could not connect to server.");

        await client.Send(request);
        EnrollResponseMessage? response = await client.Receive<EnrollResponseMessage>();
        
        if (response == null)
            return false;
        
        if (response.type != "ENROLL")
            return false;
        
        StoreCredentials(response.agent_id, response.agent_secret);
        
        return true;
    }
    
    // Validate the stored agent credentials with the server.
    public static async Task<bool> ValidateCredentials(string agentId, string agentSecret)
    {
        AuthSendMessage request = new AuthSendMessage(agentId, agentSecret);
        
        TcpClientManager client = TcpClientManager.GetInstance();

        bool connected = await client.Connect();
        if (!connected)
            throw new Exception("Could not connect to server.");

        await client.Send(request);
        AuthResponseMessage? response = await client.Receive<AuthResponseMessage>();
        
        if (response == null)
            return false;
        if (response.type != "AUTH")
            return false;
        
        return response.status;
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