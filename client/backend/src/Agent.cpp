#include "Agent.h"
#include <iostream>
#include <string>
#include "Enrollment.h"
#include "IPC.h"
#include "network/Client.h"
#include <external/nlohmann/json.hpp>

using json = nlohmann::json;

const std::string SERVER_IP = "127.0.0.1";
constexpr uint16_t SERVER_PORT = 5000;

namespace Agent {
    int run() {
        // Connect to the server
        TcpClient client;
        if (!client.connectToServer(SERVER_IP, SERVER_PORT)) {
            std::cout << "Connection failed\n";
            return 1;
        }

        // Check if agent token already exists on the computer
        bool enrolled = isAlreadyEnrolled();
        IPC::SendIsEnrolled(enrolled);

        // Receive input from the frontend
        std::string line;
        while (std::getline(std::cin, line)) {
            json msg = json::parse(line);

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