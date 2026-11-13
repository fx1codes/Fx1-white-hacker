# FX1 SHADOWCORE

**FX1 Digital Hubs — modular cybersecurity workstation and personal security research lab.**

FX1 SHADOWCORE is being developed as an extensible platform for defensive security engineering, authorized assessment, digital investigations, threat intelligence, and security automation. The roadmap describes the intended capabilities; each module is marked operational only after its implementation, tests, and required integrations are verified.

## Platform

- Next.js 16, React 19, and TypeScript dashboard.
- Python local Core Bridge with loopback binding, bearer-token authentication, health/status endpoints, and explicit assessment-scope validation.
- Passive email-domain intelligence for MX, SPF, DMARC, and nameserver DNS records.
- Server-side AI gateway foundation for OpenAI and local Ollama. It is disabled until private server environment variables are configured and is not exposed as an anonymous inference endpoint.
- GitHub Actions checks for frontend lint, tests, production build, and Python bridge tests.

## Administrator access

The Stage 4 administrator identity is `fx1faucet@gmail.com`. The address is an allowlisted account identifier, not proof of identity by itself. Sign-in also requires a private administrator password and a server-side session-signing secret.

Configure these values in Vercel Project Settings → Environment Variables and in the local server environment:

- `FX1_ADMIN_EMAIL=fx1faucet@gmail.com`
- `FX1_ADMIN_PASSWORD` — choose a unique password of at least 16 characters.
- `FX1_SESSION_SECRET` — generate a random secret of at least 32 characters (for example, `openssl rand -base64 48`).

Never commit these values or prefix them with `NEXT_PUBLIC_`. Redeploy after setting environment variables. Sessions use signed HTTP-only cookies, SameSite strict, and a 12-hour expiry. The included in-memory login throttle is best-effort only; production multi-instance deployments should add a durable rate-limit store before public exposure. For stronger proof that the administrator controls the mailbox, replace password sign-in with a verified email magic-link or passkey provider.

## Capability roadmap

### Defensive vulnerability assessment
- Asset inventory and explicit authorization/scope records.
- Safe configuration and exposure checks for owned systems.
- Dependency, TLS, security-header, and known-vulnerability review.
- Controlled web/API assessment with rate limits, evidence capture, and remediation guidance.
- Optional integration with established scanners in a controlled lab or against explicitly authorized assets.

### Social-web and open-source intelligence (OSINT)
- Search and correlate publicly available information from permitted sources.
- Domain, organization, username, and public-profile references with source links and timestamps.
- Confidence scoring, provenance, deduplication, and analyst review.
- No account takeover, private-account access, credential harvesting, or bypass of platform controls.

### IP and network intelligence
- Public IP metadata such as ASN, network owner, provider, routing context, reputation, and approximate region.
- Authorized asset inventory and network exposure checks.
- Historical evidence and confidence labels where a lawful data source supports them.
- IP geolocation is approximate and cannot reliably identify a person's exact address or live physical location.

### Security operations
- Findings, evidence, audit trail, and report generation.
- Role-based access and API usage controls.
- AI-assisted defensive analysis with server-side credentials and usage limits.
- Local Core Engine integrations for approved tools and lab workflows.

## Authorization and safety model

FX1 is intended for systems, accounts, networks, and data that the operator owns or is explicitly authorized to assess. Scanning must be limited to approved scope, with rate limits, audit records, and safe defaults. The platform is not designed to crack passwords or accounts, bypass authentication, deploy malware, evade detection, or covertly track people or devices. Password auditing should be limited to offline review of hashes or credentials supplied by the authorized owner, with no online guessing or credential attacks.

## Stage 5: assessment workspace

The initial assessment workspace supports administrator-only registration of public DNS hostnames, an explicit ownership/authorization declaration, browser-local asset inventory, a preparation checklist, and a browser-local activity trail. It does not send network probes, execute vulnerability checks, or claim to verify the authorization declaration. Browser-local records are not synchronized, durable server records, or tamper-resistant audit evidence. Central persistence and a separately reviewed, scope-enforcing assessment runner remain future work.

## Current implementation status

The roadmap above is a product direction, not a claim that every module is already available. Check the dashboard, pull requests, CI results, and module documentation for verified implementation status. The current email-intelligence feature performs public DNS checks only; it does not verify mailbox ownership. The local Core Bridge listens on loopback and cannot be reached from a hosted Vercel deployment through the server's localhost address.

## Development

```sh
pnpm install
pnpm dev
```

Run checks:

```sh
pnpm lint
pnpm test
pnpm build
python -m unittest discover -s core-bridge -p 'test_*.py'
```

## Environment

See [Core Bridge setup](core-bridge/README.md) and [AI Gateway configuration](core-bridge/AI-GATEWAY.md). Keep all credentials in local environment files or deployment secret settings, never in source control.
