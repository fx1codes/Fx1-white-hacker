# FX1 Core Bridge

A minimal local-only status bridge for the FX1 SHADOWCORE dashboard.

## Requirements

- Python 3.10+
- A random bearer token with at least 32 characters
- No third-party Python packages

## Start

Generate a token and keep it private:

```sh
export FX1_CORE_TOKEN="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
python core-bridge/server.py
```

The service binds only to `127.0.0.1` (default port `8765`). It exposes authenticated `GET /health` and `GET /api/v1/status` endpoints. It does not execute commands, scan networks, or accept target hosts.

For the Next.js application running on the same machine, configure the same token and:

```sh
FX1_CORE_ENGINE_URL=http://127.0.0.1:8765
FX1_CORE_TOKEN=<the-same-private-token>
```

Restart Next.js after changing environment variables.

## Deployment note

A hosted Vercel deployment cannot reach a bridge running on your iPhone or personal computer at `127.0.0.1`. The dashboard will correctly report the engine as disconnected in that setup. Do not expose this bridge to the public internet or set the URL to an arbitrary remote host. A future remote deployment needs a separately designed authenticated private tunnel and network policy.
