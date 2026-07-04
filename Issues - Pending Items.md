# Issues - Pending Items

## Pending

1. **PoC composition gaps vs. original** — plateau margin/zoom, right-edge spike
   towers, terrace richness and shadow softness still differ from the reference
   image; tuning knobs are documented in §3 of the study
   (`docs/reference/investigation-mandelbrot-potential-landscape-rendering.md`).
   The interactive viewer's camera/light/β controls can now be used to search
   for a closer match visually.
2. **Environment quirk** — the shell aliases `python` to Homebrew Python 3.12,
   which overrides an activated uv venv; Python scripts must be run with
   `uv run python …`.
3. **Viewer niceties (optional)** — no drag-to-move for the sphere (position is
   slider-controlled since 2026-07-04); terrain does not receive the sphere's
   cast shadow; no screenshot/export button.

## Completed

- **Decide the final reproduction route** — resolved 2026-07-04: route C
  (real-time GLSL) implemented as `web/mandelbrot-landscape-interactive.html`
  with orbit/zoom/pan, optional sphere, and user-controlled lighting; verified
  end-to-end in a headless browser (render, sphere toggle, light azimuth,
  orbit, zoom, reset, cliff slider).
