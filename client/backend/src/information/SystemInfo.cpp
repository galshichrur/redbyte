#include "SystemInfo.h"
#include <iphlpapi.h>
#include <windows.h>
#include <cstdio>
#include <string>
#pragma comment(lib, "iphlpapi.lib")
#pragma comment(lib, "ws2_32.lib")


AgentInfo collect_agent_info() {
    AgentInfo info;

    // Hostname
    char hostname[256];
    DWORD hostname_len = sizeof(hostname);
    if (GetComputerNameA(hostname, &hostname_len)) {
        info.hostname = hostname;
    }

    // OS + version
    info.os = "Windows";

    // Network (IP + MAC)
    IP_ADAPTER_INFO adapters[16];
    DWORD size = sizeof(adapters);

    if (GetAdaptersInfo(adapters, &size) == NO_ERROR) {
        for (PIP_ADAPTER_INFO a = adapters; a; a = a->Next) {

            // skip loopback
            if (a->Type == MIB_IF_TYPE_LOOPBACK)
                continue;

            // MAC
            char mac[18];
            sprintf_s(mac, "%02X:%02X:%02X:%02X:%02X:%02X",
                a->Address[0], a->Address[1], a->Address[2],
                a->Address[3], a->Address[4], a->Address[5]
            );
            info.mac = mac;

            // Local IP
            info.local_ip = a->IpAddressList.IpAddress.String;

            // Network type
            if (a->Type == MIB_IF_TYPE_ETHERNET)
                info.network_type = "ethernet";
            else if (a->Type == IF_TYPE_IEEE80211)
                info.network_type = "wifi";
            else
                info.network_type = "unknown";

            break; // take first active adapter
        }
    }

    return info;
}