using System;
using System.Net;
using PacketDotNet;
using RedByte.Agent.Network;

namespace RedByte.Agent.Detection;

public class ResponderDetector : IDetection
{
    private const ushort LlmnrPort = 5355;

    public void AnalyzePacket(Packet packet)
    {
        UdpPacket udp = packet.Extract<UdpPacket>();

        if (udp != null && (udp.SourcePort == LlmnrPort || udp.DestinationPort == LlmnrPort))
        {
            string? ip = IsSuspicious(udp);
            if (ip != null)
            {
                this.NotifyServer(true, ip);
            }
        }
    }

    private string? IsSuspicious(UdpPacket udp)
    {
        IPPacket? ipPacket = udp.ParentPacket as IPPacket;
        if (ipPacket == null) return null;

        if (udp.SourcePort == LlmnrPort)
        {
            return ipPacket.SourceAddress.ToString();
        }

        return null; 
    }

    private async void NotifyServer(bool isBlocked, string suspectedIp)
    {
        try 
        {
            AlertMessage alert = new AlertMessage(
                "Poisoning",
                "LLMNR",
                2,
                "LLMNR Spoofing detected and blocked", 
                isBlocked, 
                suspectedIp
            );

            TcpClientManager client = TcpClientManager.GetInstance();
            await client.Send(alert);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
}