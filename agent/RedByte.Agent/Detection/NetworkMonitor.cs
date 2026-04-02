using SharpPcap;
using PacketDotNet;

namespace RedByte.Agent.Detection;

public class NetworkMonitor
{
    private List<IDetection> detectors;

    public NetworkMonitor(List<IDetection> detectors)
    {
        this.detectors = detectors;
    }

    public void Start()
    {
        ICaptureDevice device = CaptureDeviceList.Instance[0];
        
        device.OnPacketArrival += (object sender, PacketCapture e) =>
        {
            RawCapture raw = e.GetPacket();
            Packet packet = Packet.ParsePacket(raw.LinkLayerType, raw.Data);

            foreach (IDetection detector in detectors)
            {
                detector.AnalyzePacket(packet);
            }
        };

        device.Open(DeviceModes.Promiscuous);
        device.StartCapture();
    }
}