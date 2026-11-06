import os
from datetime import datetime


REPORT_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "reports"
)


def generate_report(target, sections):
    os.makedirs(REPORT_DIR, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"FX1_Report_{timestamp}.txt"
    filepath = os.path.join(REPORT_DIR, filename)

    lines = [
        "=" * 60,
        "              FX1 DIGITAL HUBS",
        "             FX1 SECURITY REPORT",
        "=" * 60,
        "",
        f"Assessment Target: {target}",
        f"Assessment Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "Report Type: Authorized Security Assessment",
        "",
        "-" * 60,
    ]

    for title, content in sections.items():
        lines.append("")
        lines.append(f"[ {title.upper()} ]")
        lines.append("-" * 40)

        if isinstance(content, (list, tuple)):
            lines.extend(str(item) for item in content)
        else:
            lines.append(str(content))

    lines.extend([
        "",
        "=" * 60,
        "END OF FX1 SECURITY REPORT",
        "FX1 DIGITAL HUBS",
        "=" * 60,
    ])

    with open(filepath, "w", encoding="utf-8") as report:
        report.write("\n".join(lines))

    return filepath


def main():
    print("\n" + "=" * 48)
    print("       FX1 SECURITY REPORT GENERATOR")
    print("=" * 48)

    target = input("\nEnter assessment target: ").strip()

    if not target or len(target) > 253:
        print("\nInvalid target.")
        return

    print("\nReport sections:")

    sections = {
        "Assessment Summary": [
            "Report generated successfully.",
            "This report contains information supplied during the assessment.",
            "Findings should be manually reviewed before taking action.",
        ],
        "Security Notes": [
            "Only assess systems with explicit authorization.",
            "An open port does not automatically indicate a vulnerability.",
            "A closed port does not guarantee that a system is secure.",
        ],
    }

    filepath = generate_report(target, sections)

    print("\nReport generated successfully!")
    print(f"Saved to: {filepath}")
    print("=" * 48)


if __name__ == "__main__":
    main()
