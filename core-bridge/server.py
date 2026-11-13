#!/usr/bin/env python3
"""FX1 SHADOWCORE local status bridge.

Binds to loopback only. It exposes health/runtime metadata, not scan execution.
Set FX1_CORE_TOKEN to a random secret of at least 32 characters before starting.
"""
from __future__ import annotations

import hmac
import json
import os
import platform
import secrets
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

HOST = "127.0.0.1"
PORT = int(os.environ.get("FX1_CORE_PORT", "8765"))
TOKEN = os.environ.get("FX1_CORE_TOKEN", "")

if len(TOKEN) < 32:
    raise SystemExit("FX1_CORE_TOKEN must contain at least 32 characters; refusing to start.")


class Handler(BaseHTTPRequestHandler):
    server_version = "FX1CoreBridge/0.1"

    def _send(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        supplied = self.headers.get("Authorization", "")
        expected = f"Bearer {TOKEN}"
        if not hmac.compare_digest(supplied, expected):
            self._send(401, {"error": "Unauthorized"})
            return

        if self.path == "/health":
            self._send(200, {"ok": True, "service": "fx1-core-bridge", "version": "0.1.0"})
            return

        if self.path == "/api/v1/status":
            self._send(200, {
                "state": "connected",
                "service": "FX1 Core Bridge",
                "version": "0.1.0",
                "runtime": {
                    "python": platform.python_version(),
                    "platform": platform.system(),
                    "architecture": platform.machine(),
                },
                "capabilities": ["health", "runtime-status"],
                "security": {
                    "bind": "127.0.0.1",
                    "remote_execution": False,
                    "network_scanning": False,
                },
            })
            return

        self._send(404, {"error": "Not found"})

    def log_message(self, _format: str, *_args: object) -> None:
        # Avoid writing request headers or credentials to logs.
        return


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    server.daemon_threads = True
    print(f"FX1 Core Bridge listening on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
