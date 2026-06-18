using PacketDotNet;
using RedByte.Agent.Blocking;
using RedByte.Agent.Network;
using System.Windows;

namespace RedByte.Agent.Detection;

public class DetectionEngine
{
    private readonly List<IDetector> _detectors;
    private bool _serverErrorShown;

    public DetectionEngine(List<IDetector> detectors)
    {
        _detectors = detectors;
    }

    public async Task Analyze(Packet packet)
    {
        foreach (IDetector detector in _detectors)
        {
            try
            {
                DetectionReport? report = detector.Analyze(packet);

                if (report != null)
                {
                    await HandleReport(report);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
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
            ShowServerErrorOnce();
        }
    }

    private void ShowServerErrorOnce()
    {
        if (_serverErrorShown)
        {
            return;
        }

        _serverErrorShown = true;

        Application.Current.Dispatcher.Invoke(() =>
        {
            MessageBox.Show(
                "Server is not responding. Alerts cannot be sent right now.",
                "RedByte",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
        });
    }
}
