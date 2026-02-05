#include "Agent.h"
#include <iostream>
#include <string>
#include "Enrollment.h"
#include "IPC.h"
#include "network/Client.h"
#include <external/nlohmann/json.hpp>

using json = nlohmann::json;

const std::string SERVER_IP = "127.0.0.1";
constexpr uint16_t SERVER_PORT = 9000;

namespace Agent {
    int run() {
        TcpClient client;
        bool connected = false;

        // Wait for a frontend stdin message
        std::string line;
        while (std::getline(std::cin, line)) {
            json msg;
            try {
                msg = json::parse(line);
            } catch (...) {
                continue;
            }

            if (msg["type"] == "init") {
                connected = client.connectToServer(SERVER_IP, SERVER_PORT);
                if (!connected) {
                    IPC::SendUnableToConnectError();
                }
                break; // exit init wait loop
            }
        }

        // Check if agent token already exists and validate it
        bool enrolled = false;
        uint64_t agentId;
        ByteArray agentSecret;
        if (Enrollment::getAgentToken(agentId, agentSecret)) {
            enrolled = Enrollment::validateAgentAuth(client, agentId, agentSecret);
        }

        IPC::SendIsEnrolled(enrolled);
        if (!enrolled) {
            // Receive input from the frontend
            line = "";
            while (std::getline(std::cin, line)) {
                json msg;
                try {
                    msg = json::parse(line);
                } catch (...) {
                    continue;
                }

                if (msg["type"] == "submit_code") {
                    std::string code = msg["code"];

                    // Validate the given enrollment code
                    bool success = Enrollment::validateEnrollmentToken(client, code);
                    if (!connected) {
                        IPC::SendUnableToConnectError();
                    }
                    else {
                        IPC::SendValidationResult(success);
                    }

                }
            }
        }

        client.close();
        return 0;
    }
}