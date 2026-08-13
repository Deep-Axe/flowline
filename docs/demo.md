# Demo guide

## One-minute story

1. Open the ops console.
2. Click **Play event replay**.
3. Narrate entry rush → food-court spike → exit crush.
4. Point at dashed cyan reroutes and the ops suggestion banner.
5. Upload `samples/camera-frames/entry_rush.jpg` to show live Hugging Face CSRNet inference.

## Talking points

- Pain: pile-ups form before ops can react.
- Perception: HF CSRNet density maps (`rootstrap-org/crowd-counting`).
- Decision: capacity risk + graph reroutes, not just a count.
- Scope honesty: replay is scripted; upload is real inference; production needs calibrated cameras.

## Sample assets

| File | Use |
|---|---|
| `samples/camera-frames/quiet.jpg` | Baseline |
| `samples/camera-frames/entry_rush.jpg` | Hotspot demo |
| `samples/camera-frames/exit_crush.jpg` | Dense crush |

UI screenshots used in the root README live in `docs/screenshots/`. Regenerate with API + console running:

```powershell
node scripts/capture_screenshots.mjs
```

Regenerate frames with `task frames` or `python scripts/generate_camera_frames.py`.
