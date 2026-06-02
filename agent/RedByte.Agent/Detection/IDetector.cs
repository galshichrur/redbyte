using PacketDotNet;

namespace RedByte.Agent.Detection;

public interface IDetector
{
    DetectionReport? Analyze(Packet packet);
}
