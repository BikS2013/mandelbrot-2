# Project Design — Mandelbrot Potential Landscape

**Goal:** reproduce the classic Peitgen–Richter "potential landscape" rendering of the
Mandelbrot set (the 1985 *Scientific American* cover / *The Beauty of Fractals* style)
through pure function rendering, and provide an interactive real-time viewer.

## Components

### 1. Study / reproduction recipe (validated)
- `docs/reference/investigation-mandelbrot-potential-landscape-rendering.md` — the
  authoritative analysis: image identification, the CPM/M mathematics
  (Douady–Hubbard potential), the height mapping, scene decomposition, and a
  comparison of four rendering routes.
- `test_scripts/poc_potential_landscape.py` — offline CPU proof-of-concept
  (Python/numpy, uv-managed) that validated the recipe; output in
  `docs/reference/poc-potential-landscape-render.png`.

### 2. Interactive viewer (route C — real-time GLSL)
- `web/mandelbrot-landscape-interactive.html` — single self-contained WebGL2 page,
  no external dependencies. Published as a Claude Artifact as well.

**Architecture (two-stage function rendering):**

1. **Field stage (JavaScript, chunked to keep the UI responsive)** — computes
   `g = √φ(c)` (φ = Douady–Hubbard potential, escape iteration, maxiter 400,
   bailout 10¹⁰) plus an interior mask over the window
   `Re ∈ [−2.7, 1.5], Im ∈ [−2.1, 2.1]` on a 1024² or 2048² grid, uploaded as an
   RG32F texture (R = √φ, G = interior).
2. **Render stage (GLSL fragment shader, full-screen triangle)** — per-pixel ray
   march of the height field `h = HSCALE · exp(−β·√φ)` (manual bilinear texture
   sampling, growing step + 10-step bisection refinement), finite-difference
   normals, Lambert shading with warm sun / cool violet ambient, optional
   shadow march, black interior "lake", analytic sphere intersection, sunset-
   gradient sky, and distance fog colored exactly like the horizon so far
   terrain melts into the sky. Post: gamma 1/1.6 + optional CRT scanlines.

**Interaction model:** orbit camera (yaw/pitch/distance around a target) with
drag; wheel/pinch zoom; right-drag or shift-drag pan (clamped to the field
window); camera-terrain collision guard (CPU-side bilinear height sampler);
render-on-demand (dirty flag) so the GPU idles when nothing changes.

**User controls:** moon-sphere toggle, cast-shadow toggle, CRT-scanline toggle,
sun azimuth (0–360°), sun elevation (3–85°), sun intensity, cliff steepness β
(2.5–8, live uniform — the field texture stores √φ so β needs no recompute),
grid resolution (1024/2048, recomputes the field), reset view.

**Key parameter defaults (matched to the validated PoC):** β = 4.8,
HSCALE = 0.55, camera orbit equivalent of position (1.75, −1.75, 1.40) looking
at (−0.90, 0.40, 0.30), sun azimuth 45° / elevation 21°, sphere at
(−1.75, 0.08) r = 0.22 resting on the terrain.

## Design decisions
- **Single-file HTML/JS/GLSL** for the viewer (no build step, no CDN) so it runs
  from `file://` and inside the Artifact CSP sandbox unchanged.
- **√φ stored in the texture, β applied in-shader** — makes cliff steepness a
  live slider instead of a field recompute.
- **Fog color ≡ horizon color** — reproduces the original's effect of peaks
  silhouetting against the sunset without any explicit sky-terrain seam.
- The viewer is deliberately **single-theme (dark)**: it is a darkroom around a
  sunset render.
