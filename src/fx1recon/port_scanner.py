"""Bounded TCP port scanner with explicit authorization enforcement."""

import ipaddress
import socket

from fx1core.authorization import create_authorized_scope
from fx1core.validation import validate_target


COMMON_PORTS = {
    21: "FTP",
    22: "SSH",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    8080: "HTTP Alternate",
    8443: "HTTPS Alternate",
}


def scan_port(host, port, scope, timeout=1.0):
    """Scan one TCP port only when the exact target and port are authorized."""

    try:
        normalized_host = str(ipaddress.ip_address(host))
    except ValueError:
        raise ValueError("Scanner requires a validated IP address.")

    if not scope.authorized or normalized_host != scope.target:
        raise PermissionError("Target is outside the authorized scope.")

    if not scope.allows_port(port):
        raise PermissionError("Port is outside the authorized scope.")

    if type(timeout) not in (int, float) or not 0 < timeout <= 5:
        raise ValueError("Timeout must be greater than 0 and at most 5 seconds.")

    family = (
        socket.AF_INET6
        if ipaddress.ip_address(normalized_host).version == 6
        else socket.AF_INET
    )

    try:
        with socket.socket(family, socket.SOCK_STREAM) as sock:
            sock.settimeout(timeout)

            if family == socket.AF_INET6:
                result = sock.connect_ex((normalized_host, port, 0, 0))
            else:
                result = sock.connect_ex((normalized_host, port))

            return result == 0

    except OSError:
        return False


def run_port_scan():
    """Run the interactive, explicitly authorized TCP port scanner."""

    print("\n" + "=" * 48)
    print("       FX1 AUTHORIZED PORT SCANNER")
    print("=" * 48)

    print("\nIMPORTANT: Only scan systems you own")
    print("or have explicit permission to assess.")

    authorization = input(
        "\nDo you have authorization to scan this target? (yes/no): "
    ).strip().lower()

    if authorization != "yes":
        print("\nScan cancelled. Authorization is required.")
        return

    target = input("\nEnter target domain or IP: ").strip()

    try:
        target = validate_target(target)
    except ValueError as error:
        print(f"\nTarget Error: {error}")
        return

    try:
        addresses = socket.getaddrinfo(
            target,
            None,
            socket.AF_INET,
            socket.SOCK_STREAM,
        )
        hosts = sorted(set(item[4][0] for item in addresses))

    except socket.gaierror:
        print("\nCould not resolve an IPv4 address.")
        return

    if not hosts:
        print("\nNo IPv4 address found.")
        return

    print("\nResolved target addresses:")
    for host in hosts:
        print(f"  {host}")

    print("\nApproved TCP ports:")
    for port, service in COMMON_PORTS.items():
        print(f"  {port:5}  {service}")

    confirmation = input(
        "\nConfirm this limited scan? (yes/no): "
    ).strip().lower()

    if confirmation != "yes":
        print("\nScan cancelled.")
        return

    scopes = {}

    try:
        for host in hosts:
            scopes[host] = create_authorized_scope(
                host,
                COMMON_PORTS.keys(),
                authorized=True,
            )
    except (ValueError, PermissionError) as error:
        print(f"\nAuthorization Error: {error}")
        return

    print("\nScanning authorized TCP ports...")
    print("-" * 48)

    for host in hosts:
        print(f"\nTarget: {host}")
        scope = scopes[host]

        for port, service in COMMON_PORTS.items():
            try:
                is_open = scan_port(host, port, scope)

                if is_open:
                    print(f"[OPEN]   {port:5}  {service}")
                else:
                    print(f"[CLOSED] {port:5}  {service}")

            except (ValueError, PermissionError) as error:
                print(f"[BLOCKED] {port:5}  {service} - {error}")

    print("\n" + "=" * 48)
    print("FX1 PORT SCAN COMPLETED")
    print("=" * 48)


if __name__ == "__main__":
    run_port_scan()
