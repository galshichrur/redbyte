#include <windows.h>
#include <string>

namespace Startup {
    bool addToStartup() {
        HKEY hKey;

        if (RegOpenKeyExA(
            HKEY_CURRENT_USER,
            "Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            0,
            KEY_SET_VALUE,
            &hKey
        ) != ERROR_SUCCESS)
            return false;

        char path[MAX_PATH];
        GetModuleFileNameA(nullptr, path, MAX_PATH);

        std::string value = "\"" + std::string(path) + "\"";

        bool result =
            RegSetValueExA(
                hKey,
                "RedByte",
                0,
                REG_SZ,
                reinterpret_cast<const BYTE*>(value.c_str()),
                static_cast<DWORD>(value.size() + 1)
            ) == ERROR_SUCCESS;

        RegCloseKey(hKey);
        return result;
    }
}