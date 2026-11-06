import pytest
from dataclasses import FrozenInstanceError

from fx1core.authorization import create_authorized_scope


def test_authorized_scope_creation():
    scope = create_authorized_scope(
        "127.0.0.1",
        [22, 80, 443],
        authorized=True,
    )

    assert scope.target == "127.0.0.1"
    assert scope.allowed_ports == (22, 80, 443)
    assert scope.authorized is True


def test_unauthorized_scope_rejected():
    with pytest.raises(PermissionError):
        create_authorized_scope(
            "127.0.0.1",
            [80],
            authorized=False,
        )


def test_approved_port_allowed():
    scope = create_authorized_scope(
        "127.0.0.1",
        [80, 443],
        authorized=True,
    )

    assert scope.allows_port(443)


def test_unapproved_port_rejected():
    scope = create_authorized_scope(
        "127.0.0.1",
        [80, 443],
        authorized=True,
    )

    assert not scope.allows_port(8080)


@pytest.mark.parametrize(
    "ports",
    [
        [],
        [0],
        [65536],
        [80, 80],
        [True],
        ["80"],
        "80",
    ],
)
def test_invalid_ports_rejected(ports):
    with pytest.raises(ValueError):
        create_authorized_scope(
            "127.0.0.1",
            ports,
            authorized=True,
        )


def test_scope_port_limit():
    ports = list(range(1, 34))

    with pytest.raises(ValueError):
        create_authorized_scope(
            "127.0.0.1",
            ports,
            authorized=True,
        )


def test_scope_is_immutable():
    scope = create_authorized_scope(
        "127.0.0.1",
        [80],
        authorized=True,
    )

    with pytest.raises(FrozenInstanceError):
        scope.target = "example.com"
