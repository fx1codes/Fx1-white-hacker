# Email Extractor Domain Ownership Hardening Prompt

You are hardening the Email Extractor module so it cannot operate without verified domain ownership or explicit authorization.

Objective:
- Enforce a fail-closed security model before any email extraction or domain processing begins.
- Require proof that the requesting entity owns or is authorized to operate on the target domain.

Required behavior:
- Require domain ownership verification before running extraction for any domain.
- Accept only approved authorization methods such as DNS TXT validation, governed admin verification, or another explicit proof-of-control mechanism.
- Bind each authorization decision to the exact domain, requesting account, and authorization window.
- Enforce verification server-side on every execution, not only in the UI.
- Fail closed if the verification is missing, expired, revoked, mismatched, or invalid.
- Log all verification checks and denial events securely for audit purposes.

Safety constraints:
- Do not allow bypasses, override flags, or fallback modes that skip verification.
- Do not silently permit extraction on subdomains without matching authorization.
- Do not run extraction for domains outside the verified scope.
- Do not accept stale or reused authorization without explicit re-validation.

Required outputs:
- Domain ownership verification workflow.
- Authorization cache or token validation logic with expiry and revocation checks.
- Clear denial responses for unauthorized or mismatched requests.
- Security logging for attempts and policy failures.

Testing requirements:
- Tests covering unauthorized domains.
- Tests covering mismatched subdomains.
- Tests covering expired or revoked proof-of-control.
- Tests covering a successful authorized extraction workflow.
- Tests confirming there are no bypasses or fallback paths.

Deliver a hardened Email Extractor that enforces domain ownership before execution and denies unauthorized access by default.
