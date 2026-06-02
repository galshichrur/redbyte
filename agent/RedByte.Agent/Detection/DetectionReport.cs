using RedByte.Agent.Models;

namespace RedByte.Agent.Detection;

public class DetectionReport
{
    public string AlertType { get; }
    public string AlertName { get; }
    public int Severity { get; }
    public string Description { get; }
    public string SuspectedAddress { get; }
    public bool ShouldBlock { get; }
    public bool BlockIncomingOnly { get; }

    public DetectionReport(
        string alertType,
        string alertName,
        int severity,
        string description,
        string suspectedAddress,
        bool shouldBlock,
        bool blockIncomingOnly = false)
    {
        AlertType = alertType;
        AlertName = alertName;
        Severity = severity;
        Description = description;
        SuspectedAddress = suspectedAddress;
        ShouldBlock = shouldBlock;
        BlockIncomingOnly = blockIncomingOnly;
    }

    public AlertMessage ToAlertMessage(bool isBlocked)
    {
        return new AlertMessage(
            AlertType,
            AlertName,
            Severity,
            Description,
            isBlocked,
            SuspectedAddress
        );
    }
}
