import json
import os
import sys
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

os.environ["FX1_CORE_TOKEN"] = "test-token-for-fx1-core-bridge-123456789"
sys.path.insert(0, str(Path(__file__).parent))
import server  # noqa: E402


class CoreBridgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://127.0.0.1:{cls.httpd.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=2)

    def request(self, path, token=None):
        headers = {}
        if token is not None:
            headers["Authorization"] = f"Bearer {token}"
        req = urllib.request.Request(f"{self.base}{path}", headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=2) as response:
                return response.status, json.loads(response.read())
        except urllib.error.HTTPError as error:
            return error.code, json.loads(error.read())

    def test_rejects_missing_token(self):
        status, payload = self.request("/health")
        self.assertEqual(status, 401)
        self.assertEqual(payload["error"], "Unauthorized")

    def test_authenticated_health(self):
        status, payload = self.request("/health", server.TOKEN)
        self.assertEqual(status, 200)
        self.assertTrue(payload["ok"])

    def test_status_disables_remote_execution_and_scanning(self):
        status, payload = self.request("/api/v1/status", server.TOKEN)
        self.assertEqual(status, 200)
        self.assertEqual(payload["state"], "connected")
        self.assertFalse(payload["security"]["remote_execution"])
        self.assertFalse(payload["security"]["network_scanning"])

    def test_unknown_route_is_not_found(self):
        status, payload = self.request("/admin", server.TOKEN)
        self.assertEqual(status, 404)
        self.assertEqual(payload["error"], "Not found")


if __name__ == "__main__":
    unittest.main()
