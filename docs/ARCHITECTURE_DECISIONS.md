# FX1 White Hacker — Architecture Decisions

This document records owner-confirmed architectural requirements for FX1 White Hacker by FX1 Digital Hubs. These decisions guide future design; they do not mean the described software exists. **File encryption, the password vault, and Gmail/Outlook integrations are planned and not implemented.** The current repository status is documented in the [README](../README.md) and [roadmap](ROADMAP.md).

## ADR-001: File encryption and decryption

- **Status:** Accepted requirement; implementation planned.
- FX1 must support user-directed file encryption and decryption using established, maintained cryptographic libraries and authenticated encryption.
- Preferred authenticated ciphers are AES-256-GCM and XChaCha20-Poly1305. Password-derived keys should use Argon2id.
- Do not invent cryptographic algorithms, use unauthenticated modes for this purpose, or store plaintext passwords.
- Persist enough versioned, non-secret parameters to decrypt supported files safely; enforce nonce uniqueness requirements for the selected cipher and reject authentication failures without exposing plaintext.
- Preserve original files unless the user explicitly selects a safe replacement workflow. Avoid destructive defaults and document recovery limitations.
- Select dependency and format details during the approved implementation phase, with security review and tests. These choices do not justify adding crypto dependencies to Phase 2 absent a concrete core-engine need.

## ADR-002: Local encrypted password vault

- **Status:** Accepted requirement; implementation planned.
- Vault data must remain in encrypted local storage on the user's device by default. There is no cloud vault dependency, and cloud synchronization is outside the default architecture.
- Require master-password authentication and derive cryptographic keys safely with a suitable password-based KDF such as Argon2id. Never store plaintext passwords or log master passwords, stored credentials, derived keys, or recovery material.
- Planned user capabilities include secure password generation and retrieval, automatic locking, encrypted backup, and encrypted restore.
- Design encrypted database formats and backups with versioning, integrity/authentication protection, safe permission handling, and documented recovery behavior. Do not claim that deleting data guarantees secure erasure on flash storage.
- Keep secrets redacted from terminal output and reports by default. Retrieval must be an explicit user action, and lock behavior must minimize exposure when the vault is not in use.
- Evaluate platform-appropriate secure key handling and maintained libraries before implementation; do not introduce vault dependencies into Phase 2 unnecessarily.

## ADR-003: Gmail and Microsoft Outlook integration

- **Status:** Accepted requirement; implementation planned.
- Support Gmail through official Google OAuth and the Gmail API, and Microsoft Outlook through official Microsoft OAuth and Microsoft Graph API.
- Use least-privilege scopes and explicit user consent. Never collect mailbox passwords, bypass provider authentication, or access mailboxes without authorization.
- Planned features include mailbox security audits, phishing analysis, suspicious attachment inspection, and security reporting for mailboxes the user is authorized to assess.
- Treat email content, attachments, OAuth tokens, and reports as sensitive. Minimize access and retention; redact secrets; do not upload mailbox data to other services without explicit informed user approval.
- Keep providers modular and handle unavailable network access or revoked/missing authorization safely. Assess official SDK and OAuth dependency choices only when the feature is approved for implementation; these are not Phase 2 dependencies by default.

## Cross-cutting implementation requirements

- Use well-maintained libraries and secure, documented APIs; do not write custom cryptographic primitives.
- Add threat modeling, input validation, error handling, secret redaction, and tests for normal and failure cases before calling a capability complete.
- Keep optional integrations optional, with availability checks and clear user-facing limitations.
- Preserve the user's data and scope. No feature may expand its own permissions, authorization, targets, or external data sharing.
- Record security-relevant operations without recording secret values.
