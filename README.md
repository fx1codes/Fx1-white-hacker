# FX1 SHADOWCORE

FX1 Digital Hubs — authorized cybersecurity workstation for defensive analysis and security operations.

## Current application

This repository is a Next.js 16, React 19, and TypeScript application. Run it locally with:

```sh
pnpm install
pnpm dev
```

The current implementation includes:

- A responsive FX1 SHADOWCORE command-center interface.
- Honest disconnected/planned statuses for services and modules that are not implemented.
- A passive Email Intelligence check for address syntax and the email domain's MX, SPF, DMARC, and nameserver DNS records.

Email DNS results do not verify mailbox ownership. DKIM checks require a selector, and public-profile or breach-exposure providers are not configured. Investigation results are held in the browser only and are not persisted.

## Not implemented

Authentication, roles, database persistence, audit logging, reports, file extraction, website crawling, assessment execution, security-tool integrations, and the Python FX1 Core Engine are not implemented. Do not treat the interface as a production security operations platform or expose the email endpoint publicly without adding authentication, abuse controls, and operational monitoring.

Only assess systems you own or have explicit permission to test. Never submit secrets, passwords, seed phrases, or private keys.

## Checks

```sh
pnpm lint
pnpm build
```
