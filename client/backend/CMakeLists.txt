cmake_minimum_required(VERSION 3.20)

project(
        redbyte_agent
        VERSION 0.1.0
        LANGUAGES CXX
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(agent
        src/main.cpp
        src/Enrollment.cpp
        src/Agent.cpp
        src/network/Client.cpp
        src/IPC.cpp
)

target_include_directories(agent
        PRIVATE
        src
)

if (WIN32)
    set_target_properties(agent PROPERTIES
            WIN32_EXECUTABLE TRUE
    )
    target_compile_definitions(agent PRIVATE UNICODE _UNICODE)
endif()

if (MINGW)
    target_link_options(agent PRIVATE
            -static-libgcc
            -static-libstdc++
    )
endif()

target_link_libraries(agent
        PRIVATE
        ws2_32
)

set_target_properties(agent PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)
