#pragma once

#include <winsock2.h>
#include <string>
#include "Message.h"

class TcpClient {
public:
    TcpClient();

    // Connect to TCP server on the given IP and port
    bool connectToServer(const std::string& ip, uint16_t port);

    // Send message using format:
    // [length (4)] [type (1)] [payload]
    bool sendMessage(const Message& msg);

    // Receive message using format:
    // [length (4)] [type (1)] [payload]
    bool receiveMessage(Message& msg);

    // Close socket and cleanup
    void close();

private:
    SOCKET sock;
};
