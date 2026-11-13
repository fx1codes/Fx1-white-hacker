# Verified-Domain Contact Inventory — Safe Implementation Brief

## Scope

Build a defensive inventory for a domain that the operator has verified they control or are authorized to administer. This feature is for reviewing the domain's own deliberately published organizational contact channels, not for harvesting people or building outreach lists.

## Authorization

- Require DNS TXT or well-known-file proof of control before any lookup.
- Generate a cryptographically random, domain-bound verification token with a 24-hour expiry.
- Revalidate the proof server-side for every lookup; never trust a client-side session flag as authorization.
- Fail closed on missing, expired, mismatched, or revoked proofs.
- Do not let a verification token authorize arbitrary subdomains unless each subdomain is independently verified.
- Add rate limits and audit events for verification, lookup, and scope removal.

## Allowed discovery

- Inspect only a small allowlist of public pages on the verified domain, such as `/`, `/contact`, `/about`, and `/.well-known/security.txt`.
- Respect robots.txt, request no more than one page per second per host, use an identifying User-Agent, and apply strict request timeouts and page limits.
- Extract only organizational role contacts that are intentionally published for security or general business contact (for example, `security@`, `abuse@`, or `info@`).
- Prefer structured contact information from `security.txt` and contact pages.
- Do not crawl third-party websites, certificate-transparency subdomains, GitHub, social media, or arbitrary linked pages.
- Do not collect or display personal-pattern addresses, infer identities, validate mailboxes, or enrich contacts with unrelated information.
- Do not send email to discovered contacts.

## Data handling and UI

- Keep results in browser session storage only; do not persist discovered addresses to a database or send them to a remote service.
- Show the source URL and discovery timestamp for each result.
- Provide clear scope status and a remove-from-scope action that clears findings from the active session and records a scope-removal audit event without retaining the address.
- Provide a local-only, manually initiated export of the permitted role-contact inventory. Do not email exports or send them to an administrator inbox.
- Do not store raw page contents, credentials, or unrelated personal data.

## Audit and testing

- Record domain identifier, pseudonymous operator identifier where available, timestamp, action type, and a concise outcome; avoid logging raw contact values when not necessary.
- Test that unverified domains, unauthorized subdomains, and expired/revoked proofs are rejected server-side.
- Test robots.txt handling, rate limits, timeouts, scope removal, session-only storage, and that personal-pattern addresses are not returned or exported.
- Test that no outbound email or third-party search requests are made.

## Deployment note

The repository currently uses the App Router under `app/` and does not show the requested `src/app/api/discover/route.ts` path. Confirm the intended route location and existing authorization/session model before implementing server handlers. Do not add a route that assumes files or security utilities exist without verifying them.
