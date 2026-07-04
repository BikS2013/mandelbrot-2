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
4. **Explorer depth limit** — set-zoom is capped at window width 10⁻¹²
   (IEEE-double per-pixel resolution). Going deeper would require perturbation
   arithmetic (reference orbit + delta iteration), which is out of scope for
   the single-file viewer today.
5. **Deep-zoom compute time** — at max depth with the 2048² grid a field
   recompute can take ~1 min (JS, single thread). Mitigations available if it
   bothers: Web-Worker pool or WebGPU compute; the 512² "fast" grid option is
   the current workaround.

## Completed

- **Self-hosted TypeScript app** — resolved 2026-07-04: the explorer is now a
  Vite 8 + TypeScript 6 project in `app/` (strict typecheck, Web-Worker field
  computation, zero runtime deps, static `dist/` build). Dev-only dependencies
  vite@8.1.3 and typescript@6.0.3 checked against the npm registry: current,
  actively published, not deprecated, `npm audit` clean (0 vulnerabilities).
  The claude.ai artifact remains as a convenience mirror of the single-file
  prototype but is no longer required.

- **Decide the final reproduction route** — resolved 2026-07-04: route C
  (real-time GLSL) implemented as `web/mandelbrot-landscape-interactive.html`
  with orbit/zoom/pan, optional sphere, and user-controlled lighting; verified
  end-to-end in a headless browser (render, sphere toggle, light azimuth,
  orbit, zoom, reset, cliff slider).
