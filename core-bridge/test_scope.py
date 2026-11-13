import unittest
from scope import create_authorized_scope, validate_target


class ScopeTests(unittest.TestCase):
    def test_normalizes_domain(self):
        self.assertEqual(validate_target("EXAMPLE.COM."), "example.com")

    def test_normalizes_ip(self):
        self.assertEqual(validate_target("127.0.0.1"), "127.0.0.1")

    def test_rejects_bad_target(self):
        with self.assertRaises(ValueError):
            validate_target("bad domain")

    def test_requires_explicit_authorization(self):
        with self.assertRaises(PermissionError):
            create_authorized_scope("127.0.0.1", [443], authorized=False)

    def test_limits_ports(self):
        scope = create_authorized_scope("127.0.0.1", [443, 8443], authorized=True)
        self.assertTrue(scope.allows_port(443))
        self.assertFalse(scope.allows_port(80))

    def test_rejects_invalid_port_values(self):
        for ports in ([], [0], [65536], [True], ["443"], [443, 443]):
            with self.subTest(ports=ports), self.assertRaises(ValueError):
                create_authorized_scope("127.0.0.1", ports, authorized=True)


if __name__ == "__main__":
    unittest.main()
