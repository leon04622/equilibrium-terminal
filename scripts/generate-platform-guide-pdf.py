"""Generate Equilibrium Platform Guide PDF via Markdown -> HTML -> Edge headless."""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "PLATFORM_USER_GUIDE.md"
HTML_PATH = ROOT / "docs" / "PLATFORM_USER_GUIDE.html"
PDF_PATH = ROOT / "docs" / "Equilibrium-Terminal-Platform-Guide.pdf"
EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")

CSS = """
@page { size: A4; margin: 18mm 14mm; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 10.5pt;
  line-height: 1.45;
  color: #1a1a1a;
  max-width: 100%;
}
h1 { font-size: 22pt; color: #0a3d4a; border-bottom: 2px solid #00a8b5; padding-bottom: 6px; margin-top: 0; }
h2 { font-size: 14pt; color: #0a3d4a; margin-top: 1.4em; page-break-after: avoid; }
h3 { font-size: 11.5pt; color: #333; margin-top: 1em; page-break-after: avoid; }
h4 { font-size: 10.5pt; color: #444; }
table { border-collapse: collapse; width: 100%; margin: 0.8em 0; font-size: 9.5pt; page-break-inside: avoid; }
th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; }
th { background: #e8f4f6; font-weight: 600; }
tr:nth-child(even) { background: #f8fafa; }
code { background: #f0f0f0; padding: 1px 4px; font-size: 9pt; }
pre { background: #f4f4f4; padding: 10px; font-size: 8.5pt; overflow-x: auto; border-left: 3px solid #00a8b5; }
blockquote { border-left: 4px solid #00a8b5; margin: 1em 0; padding: 0.4em 1em; background: #f5fafb; color: #333; }
hr { border: none; border-top: 1px solid #ddd; margin: 1.5em 0; }
ul, ol { margin: 0.4em 0 0.8em 1.2em; }
li { margin: 0.2em 0; }
.cover { text-align: center; padding: 3em 1em 2em; page-break-after: always; }
.cover h1 { border: none; font-size: 26pt; }
.cover p { color: #555; font-size: 11pt; }
.toc { page-break-after: always; }
.toc ol { line-height: 1.6; }
@media print {
  h2 { page-break-before: auto; }
  .page-break { page-break-after: always; height: 0; margin: 0; border: 0; }
}
"""


def strip_frontmatter(text: str) -> str:
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            return text[end + 3 :].lstrip()
    return text


def strip_page_break_divs(text: str) -> str:
    return re.sub(
        r'<div style="page-break-after: always;"></div>\s*',
        "\n\n---\n\n",
        text,
    )


def main() -> int:
    try:
        import markdown  # type: ignore
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown", "-q"])
        import markdown  # type: ignore

    raw = strip_frontmatter(MD_PATH.read_text(encoding="utf-8"))
    raw = strip_page_break_divs(raw)

    body = markdown.markdown(
        raw,
        extensions=["tables", "fenced_code", "toc"],
        extension_configs={"toc": {"permalink": False, "toc_depth": 2}},
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Equilibrium Terminal — Platform User Guide</title>
<style>{CSS}</style>
</head>
<body>
{body}
</body>
</html>
"""

    HTML_PATH.write_text(html, encoding="utf-8")

    if not EDGE.is_file():
        print(f"HTML written: {HTML_PATH}")
        print("Edge not found — open HTML in browser and Print to PDF.")
        return 0

    file_url = HTML_PATH.as_uri()
    PDF_PATH.parent.mkdir(parents=True, exist_ok=True)
    if PDF_PATH.exists():
        PDF_PATH.unlink()

    cmd = [
        str(EDGE),
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF_PATH}",
        file_url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0 or not PDF_PATH.is_file():
        print(f"HTML written: {HTML_PATH}")
        print("PDF generation failed:", result.stderr or result.stdout)
        return 1

    print(f"PDF: {PDF_PATH}")
    print(f"HTML: {HTML_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
