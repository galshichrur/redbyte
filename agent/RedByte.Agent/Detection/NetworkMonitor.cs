using SharpPcap;
using PacketDotNet;

namespace RedByte.Agent.Detection;

public class NetworkMonitor
{
    private DetectionEngine engine;

    public NetworkMonitor(DetectionEngine engine)
    {
        this.engine = engine;
    }

    public void Start()
    {
        ICaptureDevice device = CaptureDeviceList.Instance[0];
        
        device.OnPacketArrival += (object sender, PacketCapture e) =>
        {
            RawCapture raw = e.GetPacket();
            Packet packet = Packet.ParsePacket(raw.LinkLayerType, raw.Data);

            _ = engine.Analyze(packet);
        };

        device.Open(DeviceModes.Promiscuous);
        device.StartCapture();
    }
}
