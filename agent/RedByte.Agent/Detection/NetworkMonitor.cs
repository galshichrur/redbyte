using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using SharpPcap;
using SharpPcap.LibPcap;
using PacketDotNet;

namespace RedByte.Agent.Detection;

public class NetworkMonitor
{
    private readonly DetectionEngine engine;
    private ICaptureDevice? device;

    public NetworkMonitor(DetectionEngine engine)
    {
        this.engine = engine;
    }

    public void Start()
    {
        device = SelectCaptureDevice();
        
        device.OnPacketArrival += (object sender, PacketCapture e) =>
        {
            try
            {
                RawCapture raw = e.GetPacket();
                Packet packet = Packet.ParsePacket(raw.LinkLayerType, raw.Data);

                _ = engine.Analyze(packet);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        };

        device.Open(DeviceModes.Promiscuous);
        device.StartCapture();
    }

    private ICaptureDevice SelectCaptureDevice()
    {
        CaptureDeviceList devices = CaptureDeviceList.Instance;
        if (devices.Count == 0)
        {
            throw new InvalidOperationException("No capture devices were found.");
        }

        List<IPAddress> localAddresses = GetActiveLocalIPv4Addresses();

        foreach (ICaptureDevice captureDevice in devices)
        {
            if (captureDevice is LibPcapLiveDevice liveDevice &&
                !liveDevice.Loopback &&
                HasLocalAddress(liveDevice, localAddresses))
            {
                return captureDevice;
            }
        }

        foreach (ICaptureDevice captureDevice in devices)
        {
            if (captureDevice is LibPcapLiveDevice liveDevice && !liveDevice.Loopback)
            {
                return captureDevice;
            }
        }

        return devices[0];
    }

    private List<IPAddress> GetActiveLocalIPv4Addresses()
    {
        List<IPAddress> addresses = new List<IPAddress>();

        foreach (NetworkInterface networkInterface in NetworkInterface.GetAllNetworkInterfaces())
        {
            if (networkInterface.OperationalStatus != OperationalStatus.Up ||
                networkInterface.NetworkInterfaceType == NetworkInterfaceType.Loopback ||
                networkInterface.NetworkInterfaceType == NetworkInterfaceType.Tunnel)
            {
                continue;
            }

            foreach (UnicastIPAddressInformation address in networkInterface.GetIPProperties().UnicastAddresses)
            {
                if (address.Address.AddressFamily == AddressFamily.InterNetwork)
                {
                    addresses.Add(address.Address);
                }
            }
        }

        return addresses;
    }

    private bool HasLocalAddress(LibPcapLiveDevice device, List<IPAddress> localAddresses)
    {
        foreach (PcapAddress address in device.Addresses)
        {
            if (address.Addr == null)
            {
                continue;
            }

            string deviceAddress = address.Addr.ToString();
            foreach (IPAddress localAddress in localAddresses)
            {
                if (deviceAddress.Contains(localAddress.ToString()))
                {
                    return true;
                }
            }
        }

        return false;
    }
}
