#include "Enrollment.h"
#include <string>
#include <cstring>
#include <windows.h>
#include "external/nlohmann/json.hpp"
#include "information/SystemInfo.h"

using json = nlohmann::json;

namespace Enrollment {
    bool getAgentSecret(std::string& agentIdB64, std::string& agentSecretB64) {
        HKEY hKey;

        if (RegOpenKeyExA(
            HKEY_LOCAL_MACHINE,
            "SOFTWARE\\RedByte\\Agent",
            0,
            KEY_READ,
            &hKey
        ) != ERROR_SUCCESS)
            return false;

        DWORD idSize = 0;
        RegQueryValueExA(
            hKey,
            "AgentId",
            nullptr,
            nullptr,
            nullptr,
            &idSize
        );

        agentIdB64.resize(idSize);

        if (RegQueryValueExA(
            hKey,
            "AgentId",
            nullptr,
            nullptr,
            reinterpret_cast<BYTE*>(agentIdB64.data()),
            &idSize
        ) != ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return false;
        }

        if (!agentIdB64.empty() && agentIdB64.back() == '\0')
            agentIdB64.pop_back();

        DWORD secretSize = 0;
        RegQueryValueExA(
            hKey,
            "AgentSecret",
            nullptr,
            nullptr,
            nullptr,
            &secretSize
        );

        agentSecretB64.resize(secretSize);

        if (RegQueryValueExA(
            hKey,
            "AgentSecret",
            nullptr,
            nullptr,
            reinterpret_cast<BYTE*>(agentSecretB64.data()),
            &secretSize
        ) != ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return false;
        }

        if (!agentSecretB64.empty() && agentSecretB64.back() == '\0')
            agentSecretB64.pop_back();

        RegCloseKey(hKey);
        return true;
    }
    bool storeAgentSecret(const std::string& agentIdB64, const std::string& agentSecretB64) {
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
            REG_SZ,
            reinterpret_cast<const BYTE*>(agentIdB64.c_str()),
            static_cast<DWORD>(agentIdB64.size() + 1)
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

        AgentInfo info = collect_agent_info();
        req["hostname"] = info.hostname;
        req["os"] = info.os;
        req["local_ip"] = info.local_ip;
        req["mac"] = info.mac;
        req["network_type"] = info.network_type;

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

        bool status = j.value("status", false);
        if (!status)
            return false;

        if (!j.contains("agent_id") || !j["agent_id"].is_string())
            return false;

        if (!j.contains("agent_secret") || !j["agent_secret"].is_string())
            return false;

        std::string agentIdB64 = j["agent_id"].get<std::string>();
        std::string agentSecretB64 = j["agent_secret"].get<std::string>();

        storeAgentSecret(agentIdB64, agentSecretB64);
        return status;
    }
    bool validateAgentAuth(TcpClient& client, const std::string& agentIdB64, const std::string& agentSecretB64) {
        if (agentIdB64.empty() || agentSecretB64.empty())
            return false;

        json req;
        req["agent_id"] = agentIdB64;
        req["agent_secret"] = agentSecretB64;

        AgentInfo info = collect_agent_info();
        req["hostname"] = info.hostname;
        req["os"] = info.os;
        req["local_ip"] = info.local_ip;
        req["mac"] = info.mac;
        req["network_type"] = info.network_type;

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

        return j.value("status", false);;
    }
}