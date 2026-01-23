#include "client.h"
#include <cstdint>
#include <string>

class TCPClient {
    public:
        TCPClient(const std::string& ipAddress, uint16_t port);

    ~TCPClient() {
        disconnect();
    };

    void connect() {

    }
    void disconnect() {

    }
    void sendMessage(const std::string& message) {

    }
    std::string receiveMessage() {

    }
};
