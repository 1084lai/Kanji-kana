#!/usr/bin/env python3
"""Controlla che ogni requisito (REQ/NFR) abbia almeno un caso di test nel test book."""
import re
import sys
from pathlib import Path

docs = Path(__file__).resolve().parent.parent / "docs"
req_pat = re.compile(r"\b(?:REQ-[A-Z0-9]+-\d+|NFR-\d+)\b")

# Requisiti definiti: tabelle dell'analisi funzionale (righe che iniziano con l'ID)
# e sezione 2 del test book.
defined = set()
for line in (docs / "analisi-funzionale.md").read_text(encoding="utf-8").splitlines():
    m = re.match(r"\|\s*((?:REQ-[A-Z0-9]+-\d+)|(?:NFR-\d+))\s*\|", line)
    if m:
        defined.add(m.group(1))

book = (docs / "test-book.md").read_text(encoding="utf-8")
sec2 = book.split("\n## 2. ")[1].split("\n## 3. ")[0]
for line in sec2.splitlines():
    m = re.match(r"\|\s*(REQ-[A-Z0-9]+-\d+)\s*\|", line)
    if m:
        defined.add(m.group(1))

# Requisiti coperti: seconda colonna delle righe TC della sezione 3.
covered = set()
for line in book.split("\n## 3. ")[1].split("\n## 4. ")[0].splitlines():
    cols = [c.strip() for c in line.split("|")]
    if len(cols) > 3 and cols[1].startswith("TC-"):
        covered.update(req_pat.findall(cols[2]))

missing = sorted(defined - covered)
unknown = sorted(covered - defined)
print(f"Requisiti definiti: {len(defined)}; coperti: {len(defined & covered)}")
if missing:
    print("Senza test:", ", ".join(missing))
if unknown:
    print("TC che citano requisiti inesistenti:", ", ".join(unknown))
sys.exit(1 if missing or unknown else 0)
