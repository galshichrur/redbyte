#include "enroll_gui.h"
#include <windows.h>


LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    if (msg == WM_DESTROY) {
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProc(hwnd, msg, wParam, lParam);
}

int run_enrollment_gui() {
    WNDCLASSA wc = {};
    wc.lpfnWndProc = WndProc;
    wc.lpszClassName = "redbyte";

    RegisterClassA(&wc);

    HWND hwnd = CreateWindowA(
        "redbyte",
        "RedByte - Connect to your account",
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT,
        1000, 500,
        NULL, NULL, NULL, NULL
    );

    ShowWindow(hwnd, SW_SHOW);

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) {
        DispatchMessage(&msg);
    }
    return 0;
}
