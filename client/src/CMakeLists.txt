cmake_minimum_required(VERSION 3.31)
project(client)

set(CMAKE_CXX_STANDARD 17)

add_executable(client main.cpp
        gui/enroll_gui.cpp
        gui/enroll_gui.h)
