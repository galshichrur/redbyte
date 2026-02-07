#pragma once
#include <string>
#include "network/Client.h"

namespace Enrollment {
    bool getAgentSecret(std::string& agentIdB64, std::string& agentSecretB64);
    bool storeAgentSecret(const std::string& agentIdB64, const std::string& agentSecretB64);
    bool validateEnrollmentToken(TcpClient& client, const std::string& code);
    bool validateAgentAuth(TcpClient& client, const std::string& agentIdB64, const std::string& agentSecretB64);
}
