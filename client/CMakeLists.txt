cmake_minimum_required(VERSION 3.31)
project(client)

set(CMAKE_CXX_STANDARD 17)

add_executable(client src/main.cpp
        src/gui/enroll_gui.cpp
        src/gui/enroll_gui.h)
