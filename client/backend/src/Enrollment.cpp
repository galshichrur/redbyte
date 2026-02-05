#include "Enrollment.h"
#include <string>
#include <cstring>
#include <windows.h>
#include <vector>
#include <cstdint>

namespace Enrollment {
    // Get the agent ID, agent secret if it exists on the computer.
    bool getAgentToken(uint64_t& agentId, ByteArray& agentSecret) {
        HKEY hKey;

        if (RegOpenKeyExA(
            HKEY_LOCAL_MACHINE,
            "SOFTWARE\\RedByte\\Agent",
            0,
            KEY_READ,
            &hKey
        ) != ERROR_SUCCESS) {
            return false;
        }

        DWORD size = sizeof(agentId);
        if (RegQueryValueExA(
            hKey,
            "AgentId",
            nullptr,
            nullptr,
            (BYTE*)&agentId,
            &size
        ) != ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return false;
        }

        // Get secret size
        DWORD secretSize = 0;
        RegQueryValueExA(
            hKey,
            "AgentSecret",
            nullptr,
            nullptr,
            nullptr,
            &secretSize
        );

        agentSecret.resize(secretSize);

        if (RegQueryValueExA(
            hKey,
            "AgentSecret",
            nullptr,
            nullptr,
            agentSecret.data(),
            &secretSize
        ) != ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return false;
        }

        RegCloseKey(hKey);
        return true;
    }

    // Stores the given enrollment token on the computer.
    bool storeAgentToken(uint64_t agentId, ByteArray agentSecret) {
        HKEY hKey;

        // Create or open the key
        LONG status = RegCreateKeyExA(
            HKEY_LOCAL_MACHINE,
            "SOFTWARE\\RedByte\\Agent",
            0,
            nullptr,
            0,
            KEY_WRITE,
            nullptr,
            &hKey,
            nullptr
        );

        if (status != ERROR_SUCCESS) {
            return false;
        }

        // Store AgentId
        status = RegSetValueExA(
            hKey,
            "AgentId",
            0,
            REG_QWORD,
            reinterpret_cast<const BYTE*>(&agentId),
            sizeof(agentId)
        );

        if (status != ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return false;
        }

        // Store AgentSecret
        status = RegSetValueExA(
            hKey,
            "AgentSecret",
            0,
            REG_BINARY,
            agentSecret.data(),
            agentSecret.size()
        );

        RegCloseKey(hKey);
        return status == ERROR_SUCCESS;
    }

    // Validate the enrollment token by sending an ENROLL message to server.
    bool validateEnrollmentToken(TcpClient& client, const std::string& code) {
        Message enrollMsg;
        enrollMsg.type = MessageType::ENROLL;
        enrollMsg.payload.assign(code.begin(), code.end());

        if (!client.sendMessage(enrollMsg)) {
            return false;
        }

        Message responseMsg;
        if (!client.receiveMessage(responseMsg)) {
            return false;
        }

        if (responseMsg.type != MessageType::ENROLL) {
            return false;
        }

        // Validate payload size
        constexpr size_t PAYLOAD_SIZE = 41;
        if (responseMsg.payload.size() != PAYLOAD_SIZE) {
            return false;
        }

        const uint8_t *data = responseMsg.payload.data();

        uint8_t status = data[0];
        if (status != 1) {
            return false;
        }

        // Get agent id and agent secret
        uint64_t agentId;
        ByteArray agentSecret;

        // agent_id (8 bytes, little-endian)
        std::memcpy(&agentId, data + 1, sizeof(uint64_t));

        // agent_secret (32 bytes)
        agentSecret.assign(
            data + 1 + sizeof(uint64_t),
            data + PAYLOAD_SIZE
        );

        storeAgentToken(agentId, agentSecret);

        return true;
    }

    // Validates the agent ID, agent secret by sending an AUTH message to server.
    bool validateAgentAuth(TcpClient& client, uint64_t agentId, ByteArray agentSecret) {
        if (agentSecret.size() != 32) {
            return false;
        }

        Message authMsg;
        authMsg.type = MessageType::AUTH;
        authMsg.payload.resize(8 + 32);

        // Copy agent_id (little-endian)
        std::memcpy(authMsg.payload.data(), &agentId, 8);
        // Copy secret hash
        std::memcpy(authMsg.payload.data() + 8, agentSecret.data(), 32);

        if (!client.sendMessage(authMsg)) {
            return false;
        }

        Message responseMsg;
        if (!client.receiveMessage(responseMsg)) {
            return false;
        }

        if (responseMsg.type != MessageType::AUTH) {
            return false;
        }

        // Validate payload size
        constexpr size_t PAYLOAD_SIZE = 1;
        if (responseMsg.payload.size() != PAYLOAD_SIZE) {
            return false;
        }

        uint8_t *data = responseMsg.payload.data();
        if (*data != 1) {
            return false;
        }

        return true;
    }
}
