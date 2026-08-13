"""Export OpenAPI schema for the contracts package (no server required)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API_ROOT = ROOT / "apps" / "crowd-api"
sys.path.insert(0, str(API_ROOT))

from app.main import app  # noqa: E402


def strip_tag_prefix(openapi: dict) -> dict:
    """Make operationIds client-friendly: ops-get_venue -> get_venue."""
    for path_item in openapi.get("paths", {}).values():
        for operation in path_item.values():
            if not isinstance(operation, dict):
                continue
            tags = operation.get("tags") or []
            op_id = operation.get("operationId")
            if not tags or not op_id:
                continue
            prefix = f"{tags[0]}-"
            if op_id.startswith(prefix):
                operation["operationId"] = op_id[len(prefix) :]
    return openapi


def main() -> None:
    out_dir = ROOT / "packages" / "contracts"
    out_dir.mkdir(parents=True, exist_ok=True)
    raw = app.openapi()
    (out_dir / "openapi.raw.json").write_text(json.dumps(raw, indent=2), encoding="utf-8")
    cleaned = strip_tag_prefix(json.loads(json.dumps(raw)))
    (out_dir / "openapi.json").write_text(json.dumps(cleaned, indent=2), encoding="utf-8")
    print(f"Wrote {out_dir / 'openapi.json'}")


if __name__ == "__main__":
    main()
