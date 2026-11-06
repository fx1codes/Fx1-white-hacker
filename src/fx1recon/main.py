from fx1recon.dns_lookup import lookup_dns, display_dns_results
from fx1recon.ip_info import get_ip_info, display_ip_info
from fx1recon.network_scan import run_diagnostics
from fx1recon.port_scanner import run_port_scan
from fx1recon.report_generator import generate_report


def show_banner():
    print("\n" + "=" * 48)
    print("             FX1 RECON v1.0")
    print("       FX1 DIGITAL HUBS SECURITY")
    print("=" * 48)


def show_menu():
    print("\n[ MAIN MENU ]")
    print("1. DNS Record Lookup")
    print("2. IP Information")
    print("3. Network Diagnostics")
    print("4. Authorized Port Scanner")
    print("5. Generate Security Report")
    print("0. Exit")
    print("=" * 48)


def dns_menu():
    domain = input("\nEnter target domain: ").strip()
    try:
        results = lookup_dns(domain)
        display_dns_results(results)
    except ValueError as error:
        print(f"\nInput Error: {error}")


def ip_menu():
    target = input("\nEnter domain or IP address: ").strip()
    try:
        results = get_ip_info(target)
        display_ip_info(results)
    except ValueError as error:
        print(f"\nInput Error: {error}")


def report_menu():
    target = input("\nEnter assessment target: ").strip()

    if not target or len(target) > 253:
        print("\nInvalid target.")
        return

    sections = {
        "Assessment Summary": [
            "Report generated successfully.",
            "This report contains information supplied during the assessment.",
            "Findings should be manually reviewed before taking action.",
        ],
        "Security Notes": [
            "Only assess systems with explicit authorization.",
            "An open port does not automatically indicate a vulnerability.",
            "A closed port does not guarantee that a system is secure.",
        ],
    }

    filepath = generate_report(target, sections)
    print("\nSecurity report generated successfully!")
    print(f"Saved to: {filepath}")


def main():
    while True:
        show_banner()
        show_menu()
        choice = input("Select an option: ").strip()

        if choice == "1":
            dns_menu()
        elif choice == "2":
            ip_menu()
        elif choice == "3":
            run_diagnostics()
        elif choice == "4":
            run_port_scan()
        elif choice == "5":
            report_menu()
        elif choice == "0":
            print("\nThank you for using FX1 Recon!")
            print("FX1 DIGITAL HUBS")
            break
        else:
            print("\nInvalid selection. Please try again.")


if __name__ == "__main__":
    main()
