namespace RedByte.Agent.Detection;

public static class DetectionSetup
{
    public static List<IDetector> CreateDetectors()
    {
        return new List<IDetector>
        {
            new ArpPoisoningDetector(),
            new PortScanDetector(),
            new LlmnrSpoofingDetector()
        };
    }
}
