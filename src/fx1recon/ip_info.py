import socket
import ipaddress


def get_ip_info(target):
    """Resolve a hostname or inspect an IP address."""

    target = target.strip()

    if not target:
        raise ValueError("Please enter a domain or IP address.")

    addresses = set()

    try:
        ip = ipaddress.ip_address(target)
        addresses.add(ip)

    except ValueError:
        try:
            results = socket.getaddrinfo(
                target,
                None,
                socket.AF_UNSPEC,
                socket.SOCK_STREAM
            )

            for result in results:
                addresses.add(ipaddress.ip_address(result[4][0]))

        except socket.gaierror:
            raise ValueError("Unable to resolve the hostname.")

    report = []

    for ip in sorted(addresses, key=lambda item: (item.version, int(item))):
        report.append({
            "address": str(ip),
            "version": f"IPv{ip.version}",
            "is_global": ip.is_global,
            "is_private": ip.is_private,
            "is_loopback": ip.is_loopback,
            "is_reserved": ip.is_reserved,
            "is_multicast": ip.is_multicast
        })

    return report


def display_ip_info(results):
    print("\n" + "=" * 45)
    print("          FX1 RECON - IP REPORT")
    print("=" * 45)

    for item in results:
        print(f"\nIP Address: {item['address']}")
        print(f"Version: {item['version']}")
        print(f"Public/Global: {item['is_global']}")
        print(f"Private: {item['is_private']}")
        print(f"Loopback: {item['is_loopback']}")
        print(f"Reserved: {item['is_reserved']}")
        print(f"Multicast: {item['is_multicast']}")

    print("\n" + "=" * 45)


if __name__ == "__main__":
    target = input("Enter a domain or IP address: ")

    try:
        results = get_ip_info(target)
        display_ip_info(results)

    except ValueError as error:
        print(f"\nInput Error: {error}")
