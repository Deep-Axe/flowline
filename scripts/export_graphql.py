"""Export GraphQL SDL for Angular codegen and stale checks."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API_ROOT = ROOT / "apps" / "crowd-api"
sys.path.insert(0, str(API_ROOT))

from strawberry.printer import print_schema

from app.graphql_schema import schema  # noqa: E402


def main() -> None:
    out = ROOT / "packages" / "contracts" / "schema.graphql"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(print_schema(schema) + "\n", encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
