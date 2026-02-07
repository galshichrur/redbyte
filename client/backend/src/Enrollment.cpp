#include "Enrollment.h"
#include <string>
#include <cstring>
#include <windows.h>
#include "external/nlohmann/json.hpp"

using json = nlohmann::json;

namespace Enrollment {
    bool getAgentSecret(uint64_t& agentId, std::string& agentSecretB64) {
        HKEY hKey;

        if (RegOpenKeyExA(
            HKEY_LOCAL_MACHINE,
            "SOFTWARE\\RedByte\\Agent",
            0,
            KEY_READ,
            &hKey
        ) != ERROR_SUCCESS)
            return false;

        DWORD size = sizeof(agentId);
        if (RegQueryValueExA(
            hKey,
            "AgentId",
            nullptr,
            nullptr,
            reinterpret_cast<BYTE*>(&agentId),
            &size
        ) != ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return false;
        }

        DWORD strSize = 0;
        RegQueryValueExA(
            hKey,
            "AgentSecret",
            nullptr,
            nullptr,
            nullptr,
            &strSize
        );

        agentSecretB64.resize(strSize);

        if (RegQueryValueExA(
            hKey,
            "AgentSecret",
            nullptr,
            nullptr,
            reinterpret_cast<BYTE*>(agentSecretB64.data()),
            &strSize
        ) != ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return false;
        }

        // remove trailing null
        if (!agentSecretB64.empty() && agentSecretB64.back() == '\0')
            agentSecretB64.pop_back();

        RegCloseKey(hKey);
        return true;
    }
    bool storeAgentSecret(uint64_t agentId, const std::string& agentSecretB64) {
        HKEY hKey;

        if (RegCreateKeyExA(
            HKEY_LOCAL_MACHINE,
            "SOFTWARE\\RedByte\\Agent",
            0,
            nullptr,
            0,
            KEY_WRITE,
            nullptr,
            &hKey,
            nullptr
        ) != ERROR_SUCCESS)
            return false;

        if (RegSetValueExA(
            hKey,
            "AgentId",
            0,
            REG_QWORD,
            reinterpret_cast<const BYTE*>(&agentId),
            sizeof(agentId)
        ) != ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return false;
        }

        if (RegSetValueExA(
            hKey,
            "AgentSecret",
            0,
            REG_SZ,
            reinterpret_cast<const BYTE*>(agentSecretB64.c_str()),
            static_cast<DWORD>(agentSecretB64.size() + 1)
        ) != ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return false;
        }

        RegCloseKey(hKey);
        return true;
    }

    bool validateEnrollmentToken(TcpClient& client, const std::string& code) {
        // Construct the message to send
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

        if (!j.contains("status") || j["status"] != true)
            return false;

        uint64_t agentId = j["agent_id"];
        std::string agentSecretB64 = j["agent_secret"];

        return storeAgentSecret(agentId, agentSecretB64);
    }
    bool validateAgentAuth(TcpClient& client, uint64_t agentId, const std::string& agentSecretB64) {
        if (agentSecretB64.empty())
            return false;

        json req;
        req["agent_id"] = agentId;
        req["agent_secret"] = agentSecretB64;

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

        return j.contains("status") && j["status"] == true;
    }
}