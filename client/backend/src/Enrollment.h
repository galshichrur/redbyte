#pragma once
#include <string>
#include "network/Client.h"

namespace Enrollment {
    bool getAgentSecret(uint64_t& agentId, std::string& agentSecretB64);
    bool storeAgentSecret(uint64_t agentId, const std::string& agentSecretB64);
    bool validateEnrollmentToken(TcpClient& client, const std::string& code);
    bool validateAgentAuth(TcpClient& client, uint64_t agentId, const std::string& agentSecretB64);
}
