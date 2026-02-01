#pragma once
#include <string>
#include "network/Client.h"

bool isAlreadyEnrolled();
bool validateToken(TcpClient& client, const std::string& code);
