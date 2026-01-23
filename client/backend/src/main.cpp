#include <iostream>
#include "nlohmann/json.hpp"

using json = nlohmann::json;

bool check() {
    return true;
}

bool enroll(const std::string& code) {
    return true;
}

int main() {
    json res;
    res["success"] = check();
    std::cout << res.dump();
    return 0;
}
