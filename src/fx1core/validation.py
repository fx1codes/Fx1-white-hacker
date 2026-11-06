"""Input validation utilities for FX1 White Hacker."""

import ipaddress
import re


def validate_domain(domain: str) -> str:
    """Validate and normalize a domain name."""

    if not isinstance(domain, str):
        raise ValueError("Domain must be text.")

    domain = domain.strip().rstrip(".")

    if not domain:
        raise ValueError("Domain name cannot be empty.")

    try:
        domain = domain.encode("idna").decode("ascii").lower()
    except UnicodeError:
        raise ValueError("Invalid internationalized domain name.")

    if len(domain) > 253:
        raise ValueError("Domain name is too long.")

    # Reject malformed dotted-decimal IPv4 addresses.
    if re.fullmatch(r"[0-9]+(?:\.[0-9]+){3}", domain):
        raise ValueError("Invalid IPv4 address.")


    labels = domain.split(".")

    for label in labels:
        if (
            not label
            or len(label) > 63
            or not re.fullmatch(
                r"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
                label,
            )
        ):
            raise ValueError("Invalid domain name.")

    return domain


def validate_ip_address(address: str) -> str:
    """Validate and normalize an IPv4 or IPv6 address."""

    if not isinstance(address, str) or not address.strip():
        raise ValueError("IP address cannot be empty.")

    try:
        return str(ipaddress.ip_address(address.strip()))
    except ValueError:
        raise ValueError("Invalid IPv4 or IPv6 address.")


def validate_target(target: str) -> str:
    """Validate an IP address or domain without performing network access."""

    if not isinstance(target, str):
        raise ValueError("Target must be text.")

    target = target.strip()

    if not target or len(target) > 253:
        raise ValueError("Invalid target.")

    try:
        return validate_ip_address(target)
    except ValueError:
        return validate_domain(target)
