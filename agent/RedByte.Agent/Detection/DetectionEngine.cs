using PacketDotNet;
using RedByte.Agent.Blocking;
using RedByte.Agent.Network;

namespace RedByte.Agent.Detection;

public class DetectionEngine
{
    private readonly List<IDetector> _detectors;

    public DetectionEngine(List<IDetector> detectors)
    {
        _detectors = detectors;
    }

    public async Task Analyze(Packet packet)
    {
        try
        {
            foreach (IDetector detector in _detectors)
            {
                DetectionReport? report = detector.Analyze(packet);

                if (report != null)
                {
                    await HandleReport(report);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }

    private async Task HandleReport(DetectionReport report)
    {
        bool isBlocked = false;

        if (report.ShouldBlock)
        {
            if (report.BlockIncomingOnly)
            {
                isBlocked = FirewallManager.BlockIncomingIpAddress(report.SuspectedAddress);
            }
            else
            {
                isBlocked = FirewallManager.BlockIpAddress(report.SuspectedAddress);
            }
        }

        try
        {
            TcpClientManager client = TcpClientManager.GetInstance();
            await client.Send(report.ToAlertMessage(isBlocked));
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
}
