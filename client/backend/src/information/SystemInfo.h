#include <string>

struct AgentInfo {
    std::string hostname;
    std::string os;
    std::string os_version;
    std::string local_ip;
    std::string mac;
    std::string network_type;
};

AgentInfo collect_agent_info();