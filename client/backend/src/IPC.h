#pragma once

namespace IPC {
    // Send enrollment status to stdout
    void SendIsEnrolled(bool isEnrolled);

    // Send enrollment token validation result to stdout
    void SendValidationResult(bool success);

    // Send an error message to stdout
    void SendUnableToConnectError();
}
