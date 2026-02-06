#include "Enrollment.h"
#include <string>
#include <cstring>
#include <windows.h>
#include "external/nlohmann/json.hpp"

using json = nlohmann::json;

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
        // Construct message
        json req;
        req["token"] = code;

        Message msg;
        msg.type = MessageType::ENROLL;
        msg.payload = req.dump();

        // Send a message to server
        if (!client.sendMessage(msg))
            return false;

        // Receive a message from server
        Message res;
        if (!client.receiveMessage(res))
            return false;

        if (res.type != MessageType::ENROLL)
            return false;

        json j = json::parse(res.payload, nullptr, false);
        if (j.is_discarded())
            return false;

        if (!j.contains("status") || j["status"] != 1)
            return false;

        uint64_t agentId = j["agent_id"];
        std::string secretB64 = j["agent_secret"];

        ByteArray agentSecret = decodeBase64(secretB64);

        return storeAgentToken(agentId, agentSecret);
    }

    // Validates the agent ID, agent secret by sending an AUTH message to server.
    bool validateAgentAuth(TcpClient& client, uint64_t agentId, const ByteArray& agentSecret) {
        if (agentSecret.empty())
            return false;

        json req;
        req["agent_id"] = agentId;
        req["agent_secret"] = encodeBase64(agentSecret);

        Message msg;
        msg.type = MessageType::AUTH;
        msg.payload = req.dump();

        if (!client.sendMessage(msg))
            return false;

        Message res;
        if (!client.receiveMessage(res))
            return false;

        if (res.type != MessageType::AUTH)
            return false;

        json j = json::parse(res.payload, nullptr, false);
        if (j.is_discarded())
            return false;

        return j.contains("status") && j["status"] == 1;
    }
}