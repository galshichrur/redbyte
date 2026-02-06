#pragma once
#include <string>
#include <vector>
#include "network/Client.h"


typedef std::vector<uint8_t> ByteArray;

namespace Enrollment {
    bool getAgentToken(uint64_t& agentId, ByteArray& agentSecret);
    bool storeAgentToken(std::string token);
    bool validateEnrollmentToken(TcpClient& client, const std::string& code);
    bool validateAgentAuth(TcpClient& client, uint64_t agentId, ByteArray agentSecret);
}
