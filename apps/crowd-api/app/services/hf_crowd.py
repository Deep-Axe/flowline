from __future__ import annotations

import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import cv2
import numpy as np
import torch
from huggingface_hub import hf_hub_download
from PIL import Image
from torchvision import transforms

from .csrnet import CSRNet

logger = logging.getLogger(__name__)

HF_REPO = "rootstrap-org/crowd-counting"
HF_WEIGHTS = "weights.pth"


@dataclass
class CrowdEstimate:
    count: float
    density_map: np.ndarray  # 2D float array
    source: str  # "csrnet" | "heuristic"
    model_repo: str


class CrowdCounter:
    def __init__(self) -> None:
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: CSRNet | None = None
        self.ready = False
        self.error: str | None = None
        self.transform = transforms.Compose(
            [
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )
        self._try_load()

    def _try_load(self) -> None:
        try:
            weight_path = hf_hub_download(repo_id=HF_REPO, filename=HF_WEIGHTS)
            model = CSRNet()
            checkpoint = torch.load(weight_path, map_location=self.device, weights_only=False)
            state = checkpoint["state_dict"] if isinstance(checkpoint, dict) and "state_dict" in checkpoint else checkpoint
            if isinstance(state, dict) and any(k.startswith("module.") for k in state):
                state = {k.replace("module.", "", 1): v for k, v in state.items()}
            model.load_state_dict(state, strict=False)
            model.to(self.device)
            model.eval()
            self.model = model
            self.ready = True
            logger.info("Loaded CSRNet from %s", HF_REPO)
        except Exception as exc:  # noqa: BLE001
            self.error = str(exc)
            self.ready = False
            logger.warning("CSRNet load failed, using heuristic fallback: %s", exc)

    def estimate(self, image_bgr: np.ndarray) -> CrowdEstimate:
        if self.model is not None and self.ready:
            try:
                return self._csrnet_estimate(image_bgr)
            except Exception as exc:  # noqa: BLE001
                logger.warning("CSRNet inference failed, falling back: %s", exc)
        return self._heuristic_estimate(image_bgr)

    def _csrnet_estimate(self, image_bgr: np.ndarray) -> CrowdEstimate:
        assert self.model is not None
        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        # Keep inference tractable for hackathon laptops
        h, w = rgb.shape[:2]
        max_side = 768
        scale = min(1.0, max_side / max(h, w))
        if scale < 1.0:
            rgb = cv2.resize(rgb, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        tensor = self.transform(Image.fromarray(rgb)).unsqueeze(0).to(self.device)
        with torch.no_grad():
            density = self.model(tensor)
        density_np = density.squeeze().detach().cpu().numpy().astype(np.float32)
        density_np = np.maximum(density_np, 0.0)
        count = float(density_np.sum())
        # Upsample density map to original image size for zone masking
        density_full = cv2.resize(density_np, (image_bgr.shape[1], image_bgr.shape[0]), interpolation=cv2.INTER_CUBIC)
        # Rescale so sum matches count after resize
        s = float(density_full.sum())
        if s > 1e-6:
            density_full *= count / s
        return CrowdEstimate(count=count, density_map=density_full, source="csrnet", model_repo=HF_REPO)

    def _heuristic_estimate(self, image_bgr: np.ndarray) -> CrowdEstimate:
        """Edge/texture proxy when model weights unavailable — still produces a spatial map."""
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (9, 9), 0)
        edges = cv2.Canny(blur, 60, 140).astype(np.float32) / 255.0
        density = cv2.GaussianBlur(edges, (31, 31), 0)
        # Scale to a plausible count range for demo images
        count = float(density.sum() / 40.0)
        return CrowdEstimate(count=count, density_map=density, source="heuristic", model_repo=HF_REPO)


@lru_cache(maxsize=1)
def get_crowd_counter() -> CrowdCounter:
    return CrowdCounter()


def zone_counts_from_density(
    density_map: np.ndarray,
    zones: list[dict[str, Any]],
    image_w: int,
    image_h: int,
    venue_w: int,
    venue_h: int,
) -> dict[str, float]:
    """Map venue-space polygons onto the image density map and integrate counts."""
    sx = image_w / venue_w
    sy = image_h / venue_h
    results: dict[str, float] = {}
    for zone in zones:
        mask = np.zeros(density_map.shape[:2], dtype=np.uint8)
        pts = []
        for x, y in zone["polygon"]:
            pts.append([int(x * sx), int(y * sy)])
        cv2.fillPoly(mask, [np.array(pts, dtype=np.int32)], 1)
        zone_sum = float(density_map[mask == 1].sum())
        results[zone["id"]] = max(0.0, zone_sum)
    # If total is tiny, redistribute by relative texture so UI still reacts
    total = sum(results.values())
    if total < 1.0:
        # uniform low baseline so empty demo uploads don't all show zero forever
        for zid in results:
            results[zid] = 5.0
    return results


def synthesize_zone_image(zone_density: float, seed: int = 0) -> np.ndarray:
    """Generate a synthetic crowd-looking crop for demo ticks without camera frames."""
    rng = np.random.default_rng(seed)
    h, w = 240, 320
    base = np.full((h, w, 3), 40, dtype=np.uint8)
    n_people = int(8 + zone_density * 80)
    for _ in range(n_people):
        cx = int(rng.integers(10, w - 10))
        cy = int(rng.integers(10, h - 10))
        r = int(rng.integers(3, 8))
        color = (
            int(rng.integers(60, 180)),
            int(rng.integers(60, 180)),
            int(rng.integers(60, 180)),
        )
        cv2.circle(base, (cx, cy), r, color, -1)
    noise = rng.integers(0, 25, size=base.shape, dtype=np.uint8)
    return cv2.add(base, noise)
