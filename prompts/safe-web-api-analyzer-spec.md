# Safe Web & API Analyzer — Implementation Specification

## Scope and safety model

Build a low-impact, single-target analyzer for a URL the operator is authorized to assess. This specification intentionally excludes broad endpoint discovery and active exploitation-style probes. It is not a vulnerability scanner or penetration-testing engine.

The analyzer may inspect only the exact URL supplied by the operator and ordinary redirects from that request. It must not crawl, enumerate paths, brute-force routes, inject payloads, submit forms, authenticate to the target, or attempt to access sensitive files or hidden endpoints.

## Authorization and target validation

- Require an explicit authorization confirmation, operator identity, and a justification before every scan.
- Enforce authorization server-side; never rely only on a client-side checkbox.
- Use the repository's existing authorization and public-host validation helpers only after confirming their actual locations and behavior.
- Accept only HTTP and HTTPS URLs.
- Reject localhost, private, loopback, link-local, reserved, and otherwise non-public IP destinations, including DNS names that resolve to them.
- Revalidate every resolved address and redirect destination to prevent DNS rebinding and redirect-based scope escape.
- Do not scan a target that cannot be safely resolved and validated.

## Permitted checks

For the operator-supplied URL only:

1. Request the URL with a single bounded GET request and an identifying User-Agent. Apply per-request and whole-scan timeouts, response-size limits, and a small redirect cap. Revalidate each redirect target before following it.
2. Report the HTTP status, response time, final URL, and redirect statuses. Do not retain response bodies.
3. Review response headers from that same request for common defensive configuration, including HSTS, CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame protection, and cross-origin policies.
4. Identify obvious version strings in Server or X-Powered-By headers without attempting fingerprinting beyond the returned values.
5. Parse Set-Cookie headers from that response and report missing Secure, HttpOnly, and SameSite attributes. Never expose cookie values in findings, logs, or exports.
6. For HTTPS targets, perform a standard TLS handshake to the validated host and report certificate hostname validity, issuer, validity dates, and expiry window. Do not probe cipher suites or attempt protocol downgrade attacks.
7. Optionally compare the URL response's security headers against a small documented baseline. Explain that results are informational and may require context-specific review.

## Explicitly excluded checks

Do not implement:

- Path or filename probing (including `.env`, config files, backups, admin panels, or API documentation paths).
- Crawling, sitemap traversal, robots.txt enumeration, subdomain discovery, or certificate-transparency searches.
- CORS-origin reflection probes or requests using attacker-controlled Origin values.
- OPTIONS, TRACE, CONNECT, GraphQL introspection, method testing, or payload injection.
- Error-page fingerprinting requests to fabricated paths.
- Any check that attempts to retrieve secrets, personal data, source code, environment values, or internal infrastructure details.
- Automated retries or concurrency intended to increase coverage or evade rate limits.

## Findings and scoring

Return a typed result containing the submitted URL, validated final URL, response status and duration, redirect summary, TLS summary when applicable, category results, and findings. Keep evidence limited to safe header names/values or concise certificate metadata. Never include cookies, authorization headers, secrets, or response bodies.

Suggested finding fields:

- Severity: Critical, High, Medium, Low, or Info.
- Category, title, concise detail, safe evidence, remediation, and a documentation reference.

Scoring must be clearly labeled as an informational prioritization aid, not a measure of exploitability or proof of vulnerability. Avoid a Critical severity for passive configuration observations unless there is direct, reliable evidence of immediate exposure.

## UI requirements

- Follow the existing FX1 SHADOWCORE design system and project conventions.
- Show the authorization gate, validated target, check scope, and scan limitations before starting.
- Present loading, empty, success, timeout, blocked-target, and error states.
- Group findings by transport/TLS, headers, disclosure, and cookies.
- Provide a clear statement that only the supplied URL and its validated redirects were checked.
- Store scan history only in sessionStorage unless an explicitly reviewed existing findings store requires otherwise.
- Ensure export omits cookie values, response bodies, credentials, and personal data.

## Engineering and repository notes

- Inspect the repository before implementation and use its actual App Router paths. The current repository tree shows `app/` rather than `src/app/`; do not assume `src/app/api/web/route.ts` or `src/app/page.tsx` exists.
- Reuse existing helpers only after inspecting their source and validating their behavior. Do not invent imports for unavailable `gate()`, `bad()`, `publicHost()`, Auth, or findings-store APIs.
- Keep server-side outbound requests tightly bounded and enforce network-address validation at connection time where possible.
- Add tests for authorization failure, private/reserved IP rejection, DNS rebinding and redirect validation, timeout/response-size limits, redaction of cookies, and absence of excluded probing behavior.
- Document any checks that cannot be safely or reliably completed in the current deployment environment.
