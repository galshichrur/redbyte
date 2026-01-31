#pragma once
#include <iostream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

namespace IPC {

    // Send enrollment status to stdout
    inline void SendIsEnrolled(bool isEnrolled) {
        json msg = {
            {"type", "code_exists"},
            {"exists", isEnrolled}
        };

        std::cout << msg.dump() << std::endl;
        std::cout.flush();
    }

    // Send enrollment token validation result to stdout
    inline void SendValidationResult(bool success) {
        json reply = {
            {"type", "validation_result"},
            {"success", success}
        };

        std::cout << reply.dump() << std::endl;
        std::cout.flush();
    }

}
