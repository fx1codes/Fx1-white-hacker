"""Authorization and assessment-scope controls for FX1 White Hacker."""

from dataclasses import dataclass

from fx1core.validation import validate_target


MAX_SCOPE_PORTS = 32


@dataclass(frozen=True)
class AuthorizationScope:
    """Immutable scope for an explicitly authorized assessment."""

    target: str
    allowed_ports: tuple[int, ...]
    authorized: bool

    def allows_port(self, port: int) -> bool:
        """Return whether a TCP port belongs to this scope."""

        return type(port) is int and port in self.allowed_ports


def create_authorized_scope(
    target: str,
    ports,
    *,
    authorized: bool,
) -> AuthorizationScope:
    """Create a bounded assessment scope after explicit authorization."""

    if authorized is not True:
        raise PermissionError(
            "Explicit authorization is required before assessment."
        )

    normalized_target = validate_target(target)

    if isinstance(ports, (str, bytes)):
        raise ValueError("Ports must be supplied as an iterable of integers.")

    try:
        approved_ports = tuple(ports)
    except TypeError:
        raise ValueError("Invalid port collection.")

    if not approved_ports:
        raise ValueError("At least one approved port is required.")

    if len(approved_ports) > MAX_SCOPE_PORTS:
        raise ValueError(
            f"Scope cannot contain more than {MAX_SCOPE_PORTS} ports."
        )

    if any(type(port) is not int or not 1 <= port <= 65535
           for port in approved_ports):
        raise ValueError("Every port must be an integer from 1 to 65535.")

    if len(set(approved_ports)) != len(approved_ports):
        raise ValueError("Duplicate ports are not allowed.")

    return AuthorizationScope(
        target=normalized_target,
        allowed_ports=approved_ports,
        authorized=True,
    )
