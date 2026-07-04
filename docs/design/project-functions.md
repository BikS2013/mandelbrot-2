# Project Functions & Features

## F1 — Potential-landscape reproduction recipe (done)
Study documenting how the classic Peitgen–Richter Mandelbrot potential landscape
is produced (CPM/M potential → inverted height field → shaded terrain render),
validated by an offline Python PoC.
Artifacts: `docs/reference/investigation-mandelbrot-potential-landscape-rendering.md`,
`test_scripts/poc_potential_landscape.py`, `docs/reference/poc-potential-landscape-render.png`.

## F2 — Interactive real-time viewer (done)
Canonical: `app/` (self-hosted TypeScript app — see F3). Prototype:
`web/mandelbrot-landscape-interactive.html` (WebGL2, self-contained single file).

- **F2.1 Rotate / zoom / pan** — drag orbits the camera, wheel or pinch zooms,
  right-drag / shift-drag pans; camera cannot go below the terrain; Reset view
  restores the reference composition.
- **F2.2 Optional sphere** — the decorative "moon" sphere is toggled by a
  checkbox; it rests on the terrain and re-seats itself when cliff steepness
  changes.
- **F2.2a Sphere position & height** — a Sphere control group with Position X
  (−2.7…1.5), Position Y (−2.1…2.1) and Altitude (−0.15…+0.85 above the
  terrain resting point) sliders; altitude is terrain-relative, so the sphere
  follows the landscape as it moves. Controls disable and dim while the sphere
  is off.
- **F2.3 User-controlled lighting** — sun azimuth (0–360°), elevation (3–85°)
  and intensity sliders update shading and cast shadows live; shadows can be
  toggled off for slower GPUs.
- **F2.4 Terrain controls** — cliff-steepness slider (live), field grid
  resolution select (1024²/2048², recomputes with progress overlay).
- **F2.5 Period look** — optional CRT-scanline post effect, sunset-gradient sky
  and horizon fog matching the 1985/86 originals.
- **F2.6 Set-space zoom (explorer)** — zooming into the Mandelbrot set itself,
  independent of camera zoom: Region panel with clickable minimap, center/width/
  zoom readouts, Zoom ×2 / ÷2 buttons, dive-history Back, Reset region, and
  double-click-on-terrain to dive ×2 at that point. Iteration count adapts to
  depth (up to 2500), the potential is computed in log space and re-normalized
  per window so the landscape look is preserved at any depth; verified to
  ×84,000 (mini-Mandelbrot resolved as its own lake). Max depth: width 10⁻¹²
  (double precision).

## F3 — Self-hosted TypeScript app (done)
`app/` — Vite 8 + TypeScript 6 (strict), all F2 features ported 1:1 from the
verified prototype, plus:

- **F3.1 Static self-hosting** — `npm run build` → fully static `dist/` with
  relative paths; hostable on nginx / GitHub Pages / S3 / `npx serve`; no
  backend and no runtime dependencies.
- **F3.2 Worker-based field computation** — escape iteration + normalization
  run in a Web Worker with progress messages and a transferable result buffer;
  the UI never blocks during recomputes.
- **F3.3 Typed module architecture** — state / field / renderer / camera /
  minimap / UI split with strict typing (`npm run typecheck`); module map
  documented in `app/README.md`.
- Verified end-to-end on the production build: default render, set-dive,
  orbit/zoom, sphere altitude, light azimuth — zero console errors.
