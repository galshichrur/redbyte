#pragma once
#include <string>
#include "network/Client.h"

namespace Enrollment {
    bool getAgentToken(uint64_t& agentId, std::vector<uint8_t>& agentSecret);
    bool storeAgentToken(std::string token);
    bool validateEnrollmentToken(TcpClient& client, const std::string& code);
    bool validateAgentAuth(TcpClient& client, uint64_t agentId, ByteArray agentSecret);
}
