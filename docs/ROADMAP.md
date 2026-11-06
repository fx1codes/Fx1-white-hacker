# FX1 White Hacker Development Roadmap

This roadmap describes planned work for FX1 White Hacker by FX1 Digital Hubs. It is a plan, not a feature list: **items below are not implemented unless the repository contains working code and tests demonstrating them.** The repository currently contains documentation and project configuration only; there is no application package or CLI.

Work is intended to proceed in small, reviewed increments. Each phase should include appropriate tests, documentation, safe defaults, and an honest summary of checks performed. Do not begin a later phase without approval.

## 1. Repository foundation

- Align project documentation with the actual repository and its development status.
- Document Termux setup, development workflow, authorization expectations, and optional integrations.
- Protect local secrets, generated reports, scan results, and evidence from accidental commits.
- Preserve the existing MIT license.

## 2. FX1 Core Engine

- Establish a lightweight Python package and supported Python version.
- Provide shared configuration, validated inputs, safe logging, diagnostics, and consistent finding/report models.
- Enforce explicit authorization and allowlisted target scope before active assessment operations.
- Add a usable CLI only for capabilities that are implemented and tested.
- Verify graceful behavior when platform features, permissions, dependencies, or network access are unavailable.

## 3. FX1 Recon

- Add carefully scoped domain/DNS and IP information gathering, plus authorized network and service observations.
- Use bounded timeouts, conservative request rates, reusable functions, and clear errors.
- Distinguish observed facts from assumptions; avoid labeling an open port as a vulnerability without supporting evidence.
- Test validation, timeouts, failures, and reporting behavior.

## 4. Web and Network Security

- Add safe HTTP/TLS configuration observations, security-header and cookie checks, and authorized network diagnostics.
- Require approved targets for active checks; avoid exploitation, destructive operations, stealth, or scope expansion.
- Document limitations and provide practical remediation guidance without asserting that an unflagged system is secure.

## 5. FX1 Crypto Security

- Inspect only user-selected local files or repositories for accidental secret exposure.
- Detect relevant patterns without displaying complete secret values; redact findings in logs and reports.
- Provide safe remediation and incident-response guidance.
- Never retrieve, validate for use, or transact with another person's private keys or seed phrases.

## 6. Digital Forensics

- Support safe file hashing, metadata and file-type observations, local log analysis, and IOC identification.
- Never execute suspicious files.
- Record forensic actions and preserve evidence integrity; explain permissions and data-handling limitations.
- Protect evidence and reports as sensitive local data.

## 7. Phishing Awareness Lab

- Provide suspicious URL and email-header analysis, educational explanations, and awareness reporting.
- If simulations are added, use synthetic identities and clearly identified training pages.
- Never collect real passwords, tokens, cookies, or private credentials; do not enable unauthorized deployment.

## 8. AI Security Intelligence

- Define an optional provider interface for explaining findings, prioritizing risks, and drafting remediation/report text.
- Keep the toolkit useful without AI credentials or network access.
- Store credentials in environment variables or an appropriate secret store; redact them from output.
- Treat AI output as advisory. AI must not run arbitrary commands, perform scans, or expand authorized scope.
- Send assessment data to an external provider only with explicit user approval.

## 9. FX1 Mobile Security Lab

**Future requirement only — not implemented and not authorized to begin until the core FX1 engine is complete and approved.**

The intended module is for authorized Android security education and assessment, with compatibility considered for Android Termux and optional Kali NetHunter Rootless environments. Compatibility must be detected and limitations reported; root access or Kali tooling must not be assumed.

Potential, explicitly authorized capabilities include:

- ADB availability checks and discovery/diagnostics for devices whose owner has authorized the assessment.
- Basic connected-device information and application inventory within Android's access and permission model.
- Offline APK static inspection, application-permission auditing, and security-configuration observations.
- Modular optional adapters for tools such as MobSF, JADX, Apktool, and Frida, with missing-tool checks and no mandatory heavy dependencies.
- Authorized application dynamic testing only in a controlled environment and within documented scope.
- Mobile network security observations and forensic file hashing/evidence reporting with clear audit records and protected outputs.

This module must not secretly access devices, extract messages/calls/credentials, activate cameras or microphones, install spyware, establish persistence, or perform covert surveillance. Root and non-root capabilities, Android version restrictions, ADB trust requirements, data sensitivity, and evidence-handling procedures must be documented before release.

## 10. Testing and Release

- Build a focused automated test suite for implemented behavior, including invalid input, missing tools, network failures, authorization enforcement, permissions, and secret redaction as applicable.
- Add appropriate code quality and security checks only when the project configuration supports them.
- Verify Termux behavior where practical and clearly document platform-specific limitations.
- Review dependencies, documentation, license notices, generated-data handling, and release artifacts.
- Publish only features whose behavior and tests have been verified; do not claim unrun checks passed.
