#include <iostream>
#include "nlohmann/json.hpp"

using json = nlohmann::json;

bool is_already_enrolled() {
    // check if user already enrolled.
    return false;
}

bool enroll(const std::string& code) {
    return true;
}

int main() {
    json res;
    res["success"] = is_already_enrolled();

    std::cout << res.dump() << std::endl;
    std::cout.flush();

    return 0;
}
