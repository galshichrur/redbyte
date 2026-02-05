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
        // Wait for frontend stdin, then connect to the server
        TcpClient client;
        std::string line;
        while (std::getline(std::cin, line)) {
            json msg;
            try {
                msg = json::parse(line);
            } catch (...) {
                continue;
            }

            if (msg["type"] == "init") {
                bool connected = client.connectToServer(SERVER_IP, SERVER_PORT);
                if (!connected) {
                    IPC::SendUnableToConnectError();
                }
                break; // exit init wait loop
            }
        }

        // Check if agent token already exists on the computer
        bool enrolled = isAlreadyEnrolled();
        IPC::SendIsEnrolled(enrolled);

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

                // Validate the given code
                bool success = validateToken(client, code);
                IPC::SendValidationResult(success);

                if (success)
                    break;
            }
        }

        client.close();
        return 0;
    }
}