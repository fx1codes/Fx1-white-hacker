# FX1 White Hacker

**Ethical Security. Professional Intelligence. Digital Protection.**

FX1 White Hacker is an Android Termux-compatible defensive cybersecurity toolkit developed by FX1 Digital Hubs. It supports authorized security assessment, reconnaissance, analysis, and reporting.

All assessment activity must be limited to systems, networks, devices, repositories, and data that the operator owns or has explicit permission to assess.

## Project Vision

The project is designed as a three-part security workstation:

1. **FX1 Core Engine:** A Python security engine that runs locally in Android Termux.
2. **FX1 Web Command Center:** A planned browser dashboard developed with v0 and hosted through Vercel.
3. **FX1 Android Companion:** A planned Android companion for user-controlled camera, microphone, device authentication, and notifications.

The web dashboard and Android companion are planned components, not completed features.

## Current Implementation

### FX1 Core
- Domain and IP address input validation.
- Explicit authorization and assessment-scope controls.
- Bounded port-scope validation.

### FX1 Recon
- DNS lookup utilities.
- IP information lookup.
- Network scanning utilities.
- Authorization-controlled TCP port scanning.
- Text-based security report generation.
- Interactive reconnaissance menu.

### Project Engineering
- Python package configuration in `pyproject.toml`.
- Installable development package.
- Automated tests using pytest.
- Project documentation and development roadmap.

These are initial implementations. They do not represent completion of the entire planned security workstation.

## Repository Structure

```text
.
├── docs/
│   ├── ARCHITECTURE_DECISIONS.md
│   └── ROADMAP.md
├── src/
│   ├── fx1core/
│   │   ├── __init__.py
│   │   ├── authorization.py
│   │   └── validation.py
│   └── fx1recon/
│       ├── __init__.py
│       ├── dns_lookup.py
│       ├── ip_info.py
│       ├── main.py
│       ├── network_scan.py
│       ├── port_scanner.py
│       └── report_generator.py
├── tests/
├── LICENSE
├── README.md
└── pyproject.toml
```

## Requirements

- Android Termux or a compatible Python environment.
- Python 3.11 or later.
- Git.
- Internet access for installation and permitted external lookups.

## Installation in Termux

Update Termux and install prerequisites:

```bash
pkg update && pkg upgrade
pkg install git python
```

Clone the repository:

```bash
git clone https://github.com/fx1codes/Fx1-white-hacker.git
cd Fx1-white-hacker
```

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install the package and test dependencies:

```bash
python -m pip install -e ".[test]"
```

## Running FX1 Recon

With the virtual environment active:

```bash
fx1-recon
```

Alternatively:

```bash
python -m fx1recon.main
```

Follow the application's authorization prompts and scope restrictions. Assess only explicitly authorized targets.

## Running Tests

```bash
python -m pytest -q
```

## Security and Privacy Principles

- Explicit authorization is required before assessment.
- Assessment scope must be defined and restricted.
- Network operations must use conservative limits.
- No credential harvesting, password collection, MFA bypass, session theft, or covert surveillance.
- Sensitive data and security reports must be protected.
- Planned capabilities must not be presented as implemented features.
- AI integrations must not independently expand authorization or execute unrestricted commands.

## Development Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for planned development phases.

See [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) for architectural decisions.

## Project Status

**Development stage:** Initial foundation and Core Engine implementation.

The current implementation includes foundational validation, authorization controls, reconnaissance utilities, port-scanning functionality, report generation, and automated tests.

The Web Command Center, secure remote connection layer, Android Companion, and additional security labs remain planned development work.

## Project

**FX1 White Hacker**
Developed under **FX1 Digital Hubs**.

**Ethical Security. Professional Intelligence. Digital Protection.**
