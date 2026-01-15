// client.cpp : Defines the entry point for the application.
//

#include "client.h"
#include <iostream>
#include <string>
#include "nlohmann/json.hpp"

using json = nlohmann::json;

int main()
{
    std::string line;

    while (std::getline(std::cin, line)) {
        json msg = json::parse(line);
        std::string action = msg["action"];

        if (action == "check") {
            // TODO: Check if enrolled token saved locally
            bool enrolled = true;
            json response = { {"enrolled", enrolled} };
            std::cout << response.dump() << std::endl;
        }
        else if (action == "enroll") {
            std::string code = msg["code"];
            // TODO: Validate enrollment token
            bool valid = true;
            if (valid) {
				// TODO: Save enrollment token locally
                std::cout << json({ {"success", true} }).dump() << std::endl;
            }
            else {
                std::cout << json({ {"success", false}, {"error", "Invalid code"} }).dump() << std::endl;
            }
        }
    }
    return 0;
}
