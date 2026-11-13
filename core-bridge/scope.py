"""Safe assessment-scope primitives adapted from the FX1 Python core.

This module validates scope and authorization metadata only. It does not perform
DNS lookups, network requests, port scans, or command execution.
"""
from dataclasses import dataclass
import ipaddress
import re

MAX_SCOPE_PORTS = 32


def validate_target(target: str) -> str:
    if not isinstance(target, str):
        raise ValueError("Target must be text.")
    target = target.strip()
    if not target or len(target) > 253:
        raise ValueError("Invalid target.")
    try:
        return str(ipaddress.ip_address(target))
    except ValueError:
        pass
    try:
        normalized = target.rstrip(".").encode("idna").decode("ascii").lower()
    except UnicodeError as exc:
        raise ValueError("Invalid internationalized domain name.") from exc
    if not normalized or len(normalized) > 253:
        raise ValueError("Invalid target.")
    labels = normalized.split(".")
    for label in labels:
        if not label or len(label) > 63 or not re.fullmatch(
            r"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", label
        ):
            raise ValueError("Invalid domain name.")
    return normalized


@dataclass(frozen=True)
class AuthorizationScope:
    target: str
    allowed_ports: tuple[int, ...]
    authorized: bool

    def allows_port(self, port: int) -> bool:
        return type(port) is int and port in self.allowed_ports


def create_authorized_scope(target: str, ports, *, authorized: bool) -> AuthorizationScope:
    if authorized is not True:
        raise PermissionError("Explicit authorization is required.")
    normalized_target = validate_target(target)
    if isinstance(ports, (str, bytes)):
        raise ValueError("Ports must be an iterable of integers.")
    try:
        approved = tuple(ports)
    except TypeError as exc:
        raise ValueError("Invalid port collection.") from exc
    if not approved or len(approved) > MAX_SCOPE_PORTS:
        raise ValueError(f"Scope must contain 1 to {MAX_SCOPE_PORTS} ports.")
    if any(type(port) is not int or not 1 <= port <= 65535 for port in approved):
        raise ValueError("Ports must be integers from 1 to 65535.")
    if len(set(approved)) != len(approved):
        raise ValueError("Duplicate ports are not allowed.")
    return AuthorizationScope(normalized_target, approved, True)
