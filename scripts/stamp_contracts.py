"""Write sha256 stamp of openapi.json next to generated client."""
from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
openapi = ROOT / "packages" / "contracts" / "openapi.json"
stamp = ROOT / "packages" / "contracts" / "src" / "client" / ".openapi.sha256"
stamp.parent.mkdir(parents=True, exist_ok=True)
digest = hashlib.sha256(openapi.read_bytes()).hexdigest()
stamp.write_text(digest + "\n", encoding="utf-8")
print(f"stamped {stamp}")
