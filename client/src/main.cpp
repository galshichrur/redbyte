#include <iostream>
#include "gui/enroll_gui.h"

int main() {
    run_enrollment_gui();
    std::cout << "Starting redbyte client...\n";
    return 0;
}

/*
 * Load the enrollment token if it is already stored on the computer.
 * Else, returns 0.
*/
