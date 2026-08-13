from __future__ import annotations

import heapq
from typing import Any


def _undirected_adj(edges: list[dict[str, Any]]) -> dict[str, list[tuple[str, float, float]]]:
    adj: dict[str, list[tuple[str, float, float]]] = {}
    for e in edges:
        a, b = e["from"], e["to"]
        cap = float(e.get("capacity", 50))
        adj.setdefault(a, []).append((b, 1.0, cap))
        adj.setdefault(b, []).append((a, 1.0, cap))
    return adj


def shortest_path(
    graph: dict[str, Any],
    start: str,
    goals: set[str],
    zone_density: dict[str, float],
    avoid: set[str] | None = None,
) -> list[str] | None:
    """Dijkstra with density-weighted edge costs; optional nodes to avoid."""
    avoid = avoid or set()
    adj = _undirected_adj(graph["edges"])
    pq: list[tuple[float, str, list[str]]] = [(0.0, start, [start])]
    seen: set[str] = set()

    while pq:
        cost, node, path = heapq.heappop(pq)
        if node in seen:
            continue
        seen.add(node)
        if node in goals and node != start:
            return path
        for nxt, base, cap in adj.get(node, []):
            if nxt in seen:
                continue
            if nxt in avoid and nxt not in goals:
                continue
            # Penalty for crowded nodes and saturated corridors
            node_pen = 1.0 + 4.0 * zone_density.get(nxt, 0.0)
            edge_load = zone_density.get(node, 0.0) * 0.5 + zone_density.get(nxt, 0.0) * 0.5
            edge_pen = 1.0 + 3.0 * edge_load
            capacity_pen = 1.0 + max(0.0, (50 - cap) / 50.0)
            step = base * node_pen * edge_pen * capacity_pen
            heapq.heappush(pq, (cost + step, nxt, path + [nxt]))
    return None


def suggest_reroutes(
    venue: dict[str, Any],
    zone_snapshot: list[dict[str, Any]],
    bottlenecks: list[str],
) -> list[dict[str, Any]]:
    density = {z["id"]: z["density"] for z in zone_snapshot}
    labels = {z["id"]: z["label"] for z in zone_snapshot}
    types = {z["id"]: z["type"] for z in zone_snapshot}
    graph = venue["graph"]
    routes: list[dict[str, Any]] = []

    entries = [z["id"] for z in zone_snapshot if z["type"] == "entry"]
    stands = {z["id"] for z in zone_snapshot if z["type"] == "stand"}
    exits = {z["id"] for z in zone_snapshot if z["type"] == "exit"}

    # Case 1: congested entry → alternate entry / side walkway to stands
    for entry in entries:
        if entry not in bottlenecks and density.get(entry, 0) < 0.75:
            continue
        avoid = set(bottlenecks) | {
            z["id"] for z in zone_snapshot if z["type"] == "concession" and z["density"] >= 0.7
        }
        # Prefer other entries as starts if this one is blocked hard
        start = entry
        alt_entries = [e for e in entries if e != entry and density.get(e, 0) < 0.7]
        if density.get(entry, 0) >= 0.85 and alt_entries:
            start = min(alt_entries, key=lambda e: density.get(e, 0))
            avoid = avoid - {start}

        path = shortest_path(graph, start, stands, density, avoid=avoid - stands)
        if not path:
            path = shortest_path(graph, start, stands, density, avoid=set())
        if path:
            avoid_labels = [labels[a] for a in sorted(avoid) if a in labels and a not in path]
            routes.append(
                {
                    "from": start,
                    "to": path[-1],
                    "avoid_zones": sorted(list(avoid)),
                    "path": path,
                    "path_labels": [labels[p] for p in path],
                    "message": (
                        f"Reroute via {labels[start]} -> {' -> '.join(labels[p] for p in path[1:])}."
                        + (f" Avoid {', '.join(avoid_labels)}." if avoid_labels else "")
                    ),
                }
            )

    # Case 2: congested exit → alternate exit
    for ex in list(exits):
        if ex not in bottlenecks:
            continue
        start_candidates = [
            z["id"]
            for z in zone_snapshot
            if z["type"] in ("stand", "walkway") and z["density"] >= 0.4
        ] or [z["id"] for z in zone_snapshot if z["type"] == "stand"]
        alt_exits = exits - {ex}
        for start in start_candidates[:2]:
            path = shortest_path(graph, start, alt_exits, density, avoid={ex})
            if path:
                routes.append(
                    {
                        "from": start,
                        "to": path[-1],
                        "avoid_zones": [ex],
                        "path": path,
                        "path_labels": [labels[p] for p in path],
                        "message": (
                            f"Exit crush at {labels[ex]} - guide traffic from {labels[start]} "
                            f"to {labels[path[-1]]} via {' -> '.join(labels[p] for p in path[1:-1]) or 'direct link'}."
                        ),
                    }
                )
                break

    # Case 3: food court bottleneck — divert walk_main traffic via side walkway
    if "food_1" in bottlenecks:
        path = shortest_path(
            graph,
            "walk_main",
            stands,
            density,
            avoid={"food_1"},
        )
        if path:
            routes.append(
                {
                    "from": "walk_main",
                    "to": path[-1],
                    "avoid_zones": ["food_1"],
                    "path": path,
                    "path_labels": [labels[p] for p in path],
                    "message": (
                        f"Food court overloaded - divert stand-bound traffic via "
                        f"{' -> '.join(labels[p] for p in path)}."
                    ),
                }
            )

    # Case 4: main walkway congested — push flow onto side walkway
    if "walk_main" in bottlenecks and not any(r.get("from") == "gate_b" for r in routes):
        path = shortest_path(graph, "gate_b", stands, density, avoid={"walk_main"})
        if not path:
            path = shortest_path(graph, "gate_b", stands, density, avoid=set())
        if path:
            routes.append(
                {
                    "from": "gate_b",
                    "to": path[-1],
                    "avoid_zones": ["walk_main"],
                    "path": path,
                    "path_labels": [labels[p] for p in path],
                    "message": (
                        f"Main walkway saturated - send inbound flow Gate B -> "
                        f"{' -> '.join(labels[p] for p in path[1:])}."
                    ),
                }
            )

    # Deduplicate by path signature
    unique: list[dict[str, Any]] = []
    seen_paths: set[tuple[str, ...]] = set()
    for r in routes:
        key = tuple(r["path"])
        if key in seen_paths:
            continue
        seen_paths.add(key)
        unique.append(r)
    return unique[:3]


def compose_suggestion(
    zone_snapshot: list[dict[str, Any]],
    bottlenecks: list[str],
    routes: list[dict[str, Any]],
    phase: str | None = None,
) -> str:
    labels = {z["id"]: z["label"] for z in zone_snapshot}
    if not bottlenecks:
        return "Crowd levels normal across the concourse - maintain current routing."
    hot = ", ".join(labels[b] for b in bottlenecks if b in labels)
    if routes:
        return f"High density at {hot}. {routes[0]['message']}"
    phase_bit = f" ({phase})" if phase else ""
    return f"Bottlenecks detected at {hot}{phase_bit}. Open spare capacity and slow inbound flow."
