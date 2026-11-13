# Safe Network Asset Inventory — Implementation Specification

## Scope

Create a transparent inventory and configuration dashboard for public-facing hosts that the operator explicitly owns or is authorized to administer. This module is for organizing known assets and reviewing deliberately supplied metadata. It must not perform active network reconnaissance or discover new targets.

## Authorization and registry

- Require an asset to be registered before any information is displayed or reviewed.
- Store an asset label, operator-provided hostname or public IP, description, team, environment, criticality, contact, and authorization confirmation.
- Require the operator to confirm: “I own or am authorized to manage this asset.”
- Require operator identity and a meaningful justification for administrative actions.
- Provide clear edit, pause, and remove controls and an audit trail for changes.
- Validate that entered destinations are syntactically valid public hostnames or globally routable IP addresses. Reject loopback, private, link-local, multicast, reserved, and carrier-grade NAT ranges.
- Do not resolve a hostname and then make network requests to its addresses. Registration validation must not become an SSRF-capable fetch path.

## Permitted functionality

- Display and filter the operator-entered asset registry.
- Let operators attach manually supplied facts, such as a known service name, documented port inventory, certificate expiration date, DNS record baseline, and external review date.
- Track review status, owner, last-reviewed timestamp, notes, and remediation tasks.
- Show informational reminders for manually entered certificate or domain expiry dates.
- Import/export the registry as a local, operator-initiated CSV or JSON file, excluding secrets and unnecessary personal data.
- Keep state in the storage model already used by the application unless a reviewed persistence design is explicitly requested.

## Excluded behavior

Do not implement:

- TCP/UDP port probes, connection attempts, banner grabbing, service fingerprinting, or version detection.
- Host discovery, subnet scanning, CIDR expansion, or automated discovery of adjacent targets.
- DNS zone-transfer attempts, certificate-transparency enumeration, subdomain discovery, or bulk DNS lookups.
- Queries to Shodan, IP geolocation services, RDAP/WHOIS, or other third-party enrichment services.
- Exploit validation, credential testing, vulnerability verification, or interaction with exposed services.
- Background scheduling, cron-driven scans, or hidden monitoring. No checks should run automatically.
- Storing credentials, raw service responses, packet data, or sensitive personal data.

## Audit log

- Record asset creation, edits, removal, exports, and authorization changes with timestamp, operator identity, asset identifier, action, and concise result.
- Make audit entries append-only through the UI; do not provide a clear/delete action.
- Do not include secrets or raw network responses in audit records.

## UI requirements

- Match FX1 SHADOWCORE's dark navy and blue visual design, using existing project conventions and Lucide icons.
- Provide overview cards for registered assets, reviews due, and assets with unresolved manual findings.
- Provide sortable/filterable asset table and an asset detail panel with manually entered inventory, notes, review history, and remediation items.
- Clearly label data as operator-supplied and show that no network checks have been performed.
- Include authorization confirmation before edits, exports, or other scoped administrative actions.

## Repository integration notes

- Inspect the repository's actual App Router layout before implementation. The current repository tree uses `app/`, not `src/app/`.
- Do not assume `src/app/api/scan/route.ts`, `src/lib/guard.ts`, `gate()`, `bad()`, `publicHost()`, an Auth component, or an existing findings store exists without inspecting it first.
- Do not add a server route that fetches operator-supplied hosts or URLs.
- Test range validation for IPv4/IPv6 special-use ranges, authorization gating, audit append behavior, import/export redaction, and the absence of outbound network requests.
