#include "IPC.h"
#include <iostream>
#include <external/nlohmann/json.hpp>

using json = nlohmann::json;

namespace IPC {
    // Send enrollment status to stdout
    void SendIsEnrolled(bool isEnrolled) {
        json msg = {
            {"type", "code_exists"},
            {"exists", isEnrolled}
        };

        std::cout << msg.dump() << std::endl;
        std::cout.flush();
    }

    // Send enrollment token validation result to stdout
    void SendValidationResult(bool success) {
        json msg = {
            {"type", "validation_result"},
            {"success", success}
        };

        std::cout << msg.dump() << std::endl;
        std::cout.flush();
    }

}
