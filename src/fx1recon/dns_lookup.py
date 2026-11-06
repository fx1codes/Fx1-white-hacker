import dns.resolver
import dns.exception
import re

RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"]


def validate_domain(domain):
    domain = domain.strip().rstrip(".")

    if not domain:
        raise ValueError("Please enter a domain name.")

    try:
        domain = domain.encode("idna").decode("ascii").lower()
    except UnicodeError:
        raise ValueError("Invalid domain name.")

    if len(domain) > 253:
        raise ValueError("Domain name is too long.")

    labels = domain.split(".")

    for label in labels:
        if (
            not label
            or len(label) > 63
            or not re.fullmatch(
                r"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
                label
            )
        ):
            raise ValueError("Invalid domain name.")

    return domain


def lookup_dns(domain):
    domain = validate_domain(domain)

    resolver = dns.resolver.Resolver(configure=False)
    resolver.nameservers = ["1.1.1.1", "8.8.8.8"]
    resolver.timeout = 3
    resolver.lifetime = 5

    results = {
        "domain": domain,
        "records": {},
        "errors": {}
    }

    for record_type in RECORD_TYPES:
        try:
            answers = resolver.resolve(
                domain,
                record_type,
                raise_on_no_answer=False
            )

            if answers.rrset is None:
                results["records"][record_type] = []
                continue

            records = []

            for answer in answers:
                if record_type == "MX":
                    records.append({
                        "priority": answer.preference,
                        "server": str(answer.exchange)
                    })
                elif record_type == "TXT":
                    records.append(answer.to_text())
                else:
                    records.append(str(answer))

            results["records"][record_type] = records

        except dns.resolver.NXDOMAIN:
            results["errors"][record_type] = "Domain does not exist."

        except dns.resolver.NoNameservers:
            results["errors"][record_type] = "No responding nameservers."

        except dns.resolver.LifetimeTimeout:
            results["errors"][record_type] = "DNS request timed out."

        except dns.resolver.NoAnswer:
            results["records"][record_type] = []

        except dns.exception.DNSException as error:
            results["errors"][record_type] = str(error)

    return results


def display_dns_results(results):
    print("\n" + "=" * 45)
    print("          FX1 RECON - DNS REPORT")
    print("=" * 45)

    print(f"\nTarget Domain: {results['domain']}")

    for record_type, records in results["records"].items():
        print(f"\n[{record_type} RECORDS]")

        if records:
            for record in records:
                print(f"  {record}")
        else:
            print("  No records found.")

    if results["errors"]:
        print("\n[DNS ERRORS]")

        for record_type, error in results["errors"].items():
            print(f"  {record_type}: {error}")

    print("\n" + "=" * 45)


if __name__ == "__main__":
    target = input("Enter a domain to examine: ")

    try:
        results = lookup_dns(target)
        display_dns_results(results)

    except ValueError as error:
        print(f"\nInput Error: {error}")
