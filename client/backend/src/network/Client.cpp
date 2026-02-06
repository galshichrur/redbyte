#include "Client.h"
#include <vector>
#include <cstring>
#include <ws2tcpip.h>
#include "external/nlohmann/json.hpp"

using json = nlohmann::json;

#pragma comment(lib, "ws2_32.lib")

TcpClient::TcpClient()
    : sock(INVALID_SOCKET)
{
}

// Connect to TCP server on the given address
bool TcpClient::connectToServer(const std::string& ip, uint16_t port) {
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

static bool send_all(SOCKET sock, const uint8_t* data, size_t len) {
    size_t total = 0;
    while (total < len) {
        int sent = send(sock,
                        reinterpret_cast<const char*>(data + total),
                        static_cast<int>(len - total),
                        0);
        if (sent <= 0) return false;
        total += sent;
    }
    return true;
}


// Send message using format:
// [length (4)] [type (1)] [payload]
bool TcpClient::sendMessage(const Message& msg) const {
    const uint32_t length = static_cast<uint32_t>(1 + msg.payload.size());

    // send length
    if (!send_all(sock, reinterpret_cast<const uint8_t*>(&length),sizeof(length)))
        return false;

    // send type
    const uint8_t type = static_cast<uint8_t>(msg.type);
    if (!send_all(sock, &type, 1))
        return false;

    // send JSON payload
    if (!msg.payload.empty()) {
        if (!send_all(sock,reinterpret_cast<const uint8_t*>(msg.payload.data()),msg.payload.size()))
            return false;
    }

    return true;
}

// Receive message using format:
// [length (4)] [type (1)] [payload]
bool TcpClient::receiveMessage(Message& msg) const {
    uint32_t length = 0;

    // read length
    if (recv(sock, reinterpret_cast<char*>(&length),sizeof(length),MSG_WAITALL) != sizeof(length))
        return false;

    // read type
    uint8_t type = 0;
    if (recv(sock,reinterpret_cast<char*>(&type),1,MSG_WAITALL) != 1)
        return false;

    msg.type = static_cast<MessageType>(type);

    const uint32_t payloadSize = length - 1;
    msg.payload.clear();

    if (payloadSize > 0) {
        msg.payload.resize(payloadSize);

        if (recv(sock,msg.payload.data(),payloadSize,MSG_WAITALL) != payloadSize)
            return false;
    }

    return true;
}

// Close socket and cleanup
void TcpClient::close() {
    if (sock != INVALID_SOCKET) {
        closesocket(sock);
        WSACleanup();
        sock = INVALID_SOCKET;
    }
}
