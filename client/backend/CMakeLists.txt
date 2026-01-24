cmake_minimum_required(VERSION 3.20)

project(
        RedByteClient
        VERSION 0.1.0
        LANGUAGES CXX
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(redbyte_client
        src/main.cpp
)

target_include_directories(redbyte_client
        PRIVATE
        src
)

set_target_properties(redbyte_client PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)
