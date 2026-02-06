#pragma once
#include <cstdint>
#include <string>

enum class MessageType : uint8_t {
    ENROLL    = 0x01,
    AUTH      = 0x02,
    HEARTBEAT = 0x03,
    ALERT     = 0x04,
    COMMAND   = 0x05,
    TERMINATE = 0x06
};

struct Message {
    MessageType type;
    std::string payload;
};