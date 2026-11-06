import pytest

from fx1core.validation import (
    validate_domain,
    validate_ip_address,
    validate_target,
)


@pytest.mark.parametrize(
    "value, expected",
    [
        ("google.com", "google.com"),
        ("EXAMPLE.COM", "example.com"),
        ("example.org", "example.org"),
        ("example.com.", "example.com"),
        ("localhost", "localhost"),
    ],
)
def test_valid_domains(value, expected):
    assert validate_domain(value) == expected


@pytest.mark.parametrize(
    "value",
    [
        "",
        "bad domain",
        "999.999.999.999",
        "256.1.1.1",
        "-invalid.com",
        "invalid..com",
    ],
)
def test_invalid_domains(value):
    with pytest.raises(ValueError):
        validate_domain(value)


@pytest.mark.parametrize(
    "value, expected",
    [
        ("127.0.0.1", "127.0.0.1"),
        ("8.8.8.8", "8.8.8.8"),
        ("::1", "::1"),
    ],
)
def test_valid_ip_addresses(value, expected):
    assert validate_ip_address(value) == expected


@pytest.mark.parametrize(
    "value",
    [
        "",
        "999.999.999.999",
        "256.1.1.1",
        "not-an-ip",
    ],
)
def test_invalid_ip_addresses(value):
    with pytest.raises(ValueError):
        validate_ip_address(value)


@pytest.mark.parametrize(
    "value, expected",
    [
        ("google.com", "google.com"),
        ("127.0.0.1", "127.0.0.1"),
        ("8.8.8.8", "8.8.8.8"),
        ("::1", "::1"),
    ],
)
def test_valid_targets(value, expected):
    assert validate_target(value) == expected


@pytest.mark.parametrize(
    "value",
    [
        "",
        "bad domain",
        "999.999.999.999",
        "256.1.1.1",
    ],
)
def test_invalid_targets(value):
    with pytest.raises(ValueError):
        validate_target(value)


@pytest.mark.parametrize(
    "function",
    [
        validate_domain,
        validate_ip_address,
        validate_target,
    ],
)
def test_non_string_inputs(function):
    with pytest.raises(ValueError):
        function(None)
