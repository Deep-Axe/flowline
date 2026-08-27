"""Stamp GraphQL schema + generated client together."""
from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
schema = ROOT / "packages" / "contracts" / "schema.graphql"
generated = ROOT / "apps" / "ops-console" / "src" / "generated" / "graphql.ts"
stamp = ROOT / "apps" / "ops-console" / "src" / "generated" / ".graphql.sha256"
digest = hashlib.sha256(schema.read_bytes() + generated.read_bytes()).hexdigest()
stamp.write_text(digest + "\n", encoding="utf-8")
print(f"stamped {stamp}")
