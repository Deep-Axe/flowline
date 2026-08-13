"""Generate synthetic overhead crowd frames into samples/camera-frames."""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "samples" / "camera-frames"
OUT.mkdir(parents=True, exist_ok=True)


def make_frame(name: str, density: float, seed: int) -> None:
    rng = np.random.default_rng(seed)
    h, w = 480, 640
    img = np.full((h, w, 3), 48, dtype=np.uint8)
    for y in range(0, h, 40):
        cv2.line(img, (0, y), (w, y), (58, 58, 58), 1)
    for x in range(0, w, 40):
        cv2.line(img, (x, 0), (x, h), (58, 58, 58), 1)

    n = int(40 + density * 220)
    for _ in range(n):
        cx = int(rng.integers(20, w - 20))
        cy = int(rng.integers(20, h - 20))
        if density > 0.6 and rng.random() < 0.45:
            cx = int(rng.integers(20, w // 2))
        r = int(rng.integers(4, 10))
        color = (
            int(rng.integers(70, 200)),
            int(rng.integers(70, 200)),
            int(rng.integers(70, 200)),
        )
        cv2.circle(img, (cx, cy), r, color, -1)
        cv2.circle(img, (cx, cy - r // 2), max(2, r // 2), (30, 30, 30), -1)

    path = OUT / name
    cv2.imwrite(str(path), img)
    print("wrote", path)


if __name__ == "__main__":
    make_frame("quiet.jpg", 0.15, 1)
    make_frame("entry_rush.jpg", 0.75, 2)
    make_frame("exit_crush.jpg", 0.95, 3)
