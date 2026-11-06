import socket
import subprocess
import time
import ipaddress


def check_internet():
    hosts = ["1.1.1.1", "8.8.8.8"]

    for host in hosts:
        try:
            connection = socket.create_connection((host, 53), timeout=3)
            connection.close()
            return True
        except OSError:
            continue

    return False


def check_dns(domain="google.com"):
    try:
        addresses = socket.getaddrinfo(domain, None)
        return sorted(set(item[4][0] for item in addresses))
    except socket.gaierror:
        return []


def check_latency(host="1.1.1.1"):
    try:
        start = time.perf_counter()
        connection = socket.create_connection((host, 53), timeout=3)
        connection.close()
        end = time.perf_counter()

        return round((end - start) * 1000, 2)
    except OSError:
        return None


def get_local_ip():
    try:
        connection = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        connection.connect(("1.1.1.1", 80))
        address = connection.getsockname()[0]
        connection.close()
        return address
    except OSError:
        return "Unavailable"


def run_diagnostics():
    print("\n" + "=" * 45)
    print("       FX1 NETWORK DIAGNOSTICS")
    print("=" * 45)

    print("\n[1] INTERNET CONNECTIVITY")

    internet = check_internet()

    if internet:
        print("Status: CONNECTED")
    else:
        print("Status: NOT CONNECTED")

    print("\n[2] DNS RESOLUTION")

    addresses = check_dns()

    if addresses:
        print("Status: WORKING")
        for address in addresses:
            print(f"  {address}")
    else:
        print("Status: DNS RESOLUTION FAILED")

    print("\n[3] NETWORK LATENCY")

    latency = check_latency()

    if latency is not None:
        print(f"Response time: {latency} ms")
    else:
        print("Response time: Unavailable")

    print("\n[4] LOCAL NETWORK INFORMATION")

    local_ip = get_local_ip()

    print(f"Local IP Address: {local_ip}")

    try:
        ip = ipaddress.ip_address(local_ip)
        print(f"IP Version: IPv{ip.version}")
        print(f"Private Network: {ip.is_private}")
    except ValueError:
        print("IP classification: Unavailable")

    print("\n[5] DIAGNOSTIC SUMMARY")

    if internet and addresses:
        print("Network appears operational.")
    elif internet:
        print("Internet connection works, but DNS may have problems.")
    else:
        print("Internet connectivity could not be established.")

    print("\n" + "=" * 45)


if __name__ == "__main__":
    run_diagnostics()
