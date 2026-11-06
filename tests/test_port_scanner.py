import pytest

from fx1core.authorization import create_authorized_scope
from fx1recon.port_scanner import scan_port


def test_unauthorized_target_is_blocked():
    scope = create_authorized_scope(
        "127.0.0.1",
        [80],
        authorized=True,
    )

    with pytest.raises(PermissionError):
        scan_port("127.0.0.2", 80, scope)


def test_unapproved_port_is_blocked():
    scope = create_authorized_scope(
        "127.0.0.1",
        [80],
        authorized=True,
    )

    with pytest.raises(PermissionError):
        scan_port("127.0.0.1", 443, scope)


def test_invalid_ip_is_rejected():
    scope = create_authorized_scope(
        "127.0.0.1",
        [80],
        authorized=True,
    )

    with pytest.raises(ValueError):
        scan_port("invalid-ip", 80, scope)


@pytest.mark.parametrize("timeout", [0, -1, 6, "1", True])
def test_invalid_timeout_is_rejected(timeout):
    scope = create_authorized_scope(
        "127.0.0.1",
        [80],
        authorized=True,
    )

    with pytest.raises(ValueError):
        scan_port("127.0.0.1", 80, scope, timeout=timeout)


def test_authorized_scan_uses_socket_mock(monkeypatch):
    scope = create_authorized_scope(
        "127.0.0.1",
        [80],
        authorized=True,
    )

    class FakeSocket:
        def __init__(self, *args):
            self.address = None

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def settimeout(self, timeout):
            self.timeout = timeout

        def connect_ex(self, address):
            self.address = address
            return 0

    monkeypatch.setattr(
        "fx1recon.port_scanner.socket.socket",
        FakeSocket,
    )

    assert scan_port("127.0.0.1", 80, scope) is True
