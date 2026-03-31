using PacketDotNet;

namespace RedByte.Agent.Detection;

public interface IDetection
{
    public void AnalyzePacket(Packet packet);
}