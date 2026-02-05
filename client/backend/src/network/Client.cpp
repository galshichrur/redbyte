#include "Client.h"
#include <vector>
#include <cstring>
#include <ws2tcpip.h>

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
bool TcpClient::sendMessage(const Message& msg) {
    uint32_t length = static_cast<uint32_t>(1 + msg.payload.size());

    std::vector<uint8_t> frame;
    frame.resize(4 + 1 + msg.payload.size());

    // length
    std::memcpy(frame.data(), &length, 4);

    // type
    frame[4] = static_cast<uint8_t>(msg.type);

    // payload
    if (!msg.payload.empty()) {
        std::memcpy(frame.data() + 5,
                    msg.payload.data(),
                    msg.payload.size());
    }

    return send_all(sock, frame.data(), frame.size());
}

// Receive message using format:
// [length (4)] [type (1)] [payload]
bool TcpClient::receiveMessage(Message& msg) {
    uint32_t length = 0;

    // Read total length
    if (recv(sock, (char*)&length, sizeof(length), MSG_WAITALL) != sizeof(length))
        return false;

    // Read the message type
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
void TcpClient::close() {
    if (sock != INVALID_SOCKET) {
        closesocket(sock);
        WSACleanup();
        sock = INVALID_SOCKET;
    }
}
