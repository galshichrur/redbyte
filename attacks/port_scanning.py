import socket


def scan_ports(target_ip: str, start_port: int, end_port: int, timeout: float) -> None:
    print(f"Scanning {target_ip} ports {start_port}-{end_port}")

    for port in range(start_port, end_port + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(timeout)
            result = sock.connect_ex((target_ip, port))

        if result == 0:
            print(f"Port {port} is open")

    print("Scan finished")


def main() -> None:
    target_ip = input("Target IP: ").strip()
    if not target_ip:
        print("No target IP entered. Stopping.")
        return

    try:
        start_port = int(input("First port [1]: ").strip() or "1")
        end_port = int(input("Last port [100]: ").strip() or "100")
        timeout = float(input("Timeout per port in seconds [0.15]: ").strip() or "0.15")
    except ValueError:
        print("Please enter numbers for the port and timeout values.")
        return

    scan_ports(target_ip, start_port, end_port, timeout)


if __name__ == "__main__":
    main()
