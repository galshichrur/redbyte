#include <iostream>
#include <fstream>
#include <string>
#include "network/Client.cpp"
#include "IPC.h"

const std::string IP = "127.0.0.1";
const int PORT = 9000;


// Check if this computer already enrolled
bool isAlreadyEnrolled() {
    return false;
}

// Checks if the given token is correct
bool validateToken(TcpClient client, const std::string& code) {
    // Send enrollment message to server

    // Receive auth response from the server
    return true;
}

int main(int argc, char* argv[]) {
    // Connect to the server
    TcpClient client;
    if (!client.connectToServer(IP, PORT)) {
        std::cout << "Connection failed\n";
        return 1;
    }

    // Check if agent token already exists on the computer
    bool isEnrolled = isAlreadyEnrolled();
    IPC::SendIsEnrolled(isEnrolled);

    // Receive input from the frontend
    std::string line;
    while (std::getline(std::cin, line)) {
        json msg = json::parse(line);

        if (msg["type"] == "submit_code") {
            std::string code = msg["code"];

            // Validate the given code
            bool success = validateToken(client, code);
            IPC::SendValidationResult(success);

            if (success) {
                break;
            }
        }
    }

    return 0;
}
