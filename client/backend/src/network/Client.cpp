#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <string>
#include "Message.h"

#pragma comment(lib, "ws2_32.lib")


class TcpClient {
public:

    TcpClient()
        : sock(INVALID_SOCKET)
    {
    }

    // Connect to TCP server on the given address
    bool connectToServer(const std::string& ip, uint16_t port) {
        WSADATA wsa;

        if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0)
            return false;

        sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (sock == INVALID_SOCKET)
            return false;

        sockaddr_in server{};
        server.sin_family = AF_INET;
        server.sin_port = htons(port);

        inet_pton(AF_INET, ip.c_str(), &server.sin_addr);

        if (connect(sock, (sockaddr*)&server, sizeof(server)) == SOCKET_ERROR)
            return false;

        return true;
    }

    // Send message using format:
    // [length (4)] [type (1)] [payload]
    bool sendMessage(const Message& msg) {
        uint32_t length = static_cast<uint32_t>(1 + msg.payload.size());

        // Send total length
        if (send(sock, (char*)&length, sizeof(length), 0) != sizeof(length))
            return false;

        // Send message type
        if (send(sock, (char*)&msg.type, 1, 0) != 1)
            return false;

        // Send payload
        if (!msg.payload.empty()) {
            if (send(sock,
                     (char*)msg.payload.data(),
                     msg.payload.size(),
                     0) != msg.payload.size())
                return false;
        }

        return true;
    }

    // Receive message using format:
    // [length (4)] [type (1)] [payload]
    bool receiveMessage(Message& msg) {
        uint32_t length = 0;

        // Read total length
        if (recv(sock, (char*)&length, sizeof(length), MSG_WAITALL) != sizeof(length))
            return false;

        // Read message type
        if (recv(sock, (char*)&msg.type, 1, MSG_WAITALL) != 1)
            return false;

        uint32_t payloadSize = length - 1;
        msg.payload.resize(payloadSize);

        // Read payload
        if (payloadSize > 0) {
            if (recv(sock,
                     (char*)msg.payload.data(),
                     payloadSize,
                     MSG_WAITALL) != payloadSize)
                return false;
        }

        return true;
    }

    // Close socket and cleanup
    void close() {
        if (sock != INVALID_SOCKET) {
            closesocket(sock);
            WSACleanup();
            sock = INVALID_SOCKET;
        }
    }

private:
    SOCKET sock;
};
