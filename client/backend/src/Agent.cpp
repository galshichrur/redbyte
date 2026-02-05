#include "Agent.h"
#include <iostream>
#include <string>
#include "Enrollment.h"
#include "IPC.h"
#include "network/Client.h"
#include <external/nlohmann/json.hpp>
#include <thread>
#include <chrono>

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

        // Receive input from the frontend
        while (true) {
            if (!std::getline(std::cin, line)) {
                std::this_thread::sleep_for(std::chrono::milliseconds(200));
                continue;
            }

            json msg;
            try {
                msg = json::parse(line);
            } catch (...) {
                continue;
            }

            // Only care about submit_code when not enrolled
            if (!enrolled && msg["type"] == "submit_code") {
                std::string code = msg["code"];

                bool success = Enrollment::validateEnrollmentToken(client, code);
                IPC::SendValidationResult(success);

                if (success) {
                    enrolled = true;
                }
            }
        }
    }
}