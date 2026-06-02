import socket


def scan(target: str):
    print(f"Scanning {target}...")

    for port in range(1, 101):
        try:
            s = socket.socket()
            s.settimeout(0.1)

            if s.connect_ex((target, port)) == 0:
                print(f"Port {port} is open")

            s.close()

        except:
            print(".")

    print("Done")


if __name__ == '__main__':
    target = input("Target IP: ")
    scan(target)