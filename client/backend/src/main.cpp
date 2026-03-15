#include "Agent.h"
#include <windows.h>

int WINAPI WinMain(HINSTANCE, HINSTANCE, LPSTR, int) {
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

    return Agent::run();
}