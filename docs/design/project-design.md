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

### 2. Interactive explorer (route C — real-time GLSL)
- **`app/` — the canonical implementation**: self-hosted TypeScript app
  (Vite 8 + TS 6, strict mode, dev-only dependencies, zero runtime
  dependencies). `npm run build` emits a fully static `dist/` (relative asset
  paths) deployable on any web server — no backend, no claude.ai artifact
  required. Module map in `app/README.md`. The field computation runs in a
  **Web Worker** (`src/field.worker.ts`), replacing the single-file version's
  main-thread chunking.
- `web/mandelbrot-landscape-interactive.html` — the original single-file
  WebGL2 prototype (identical math/UX, no build step). Kept as a zero-tooling
  fallback; also published as a Claude Artifact.

**Coordinate model (explorer):** WORLD space is fixed — the terrain always spans
`[−2.1, 2.1]²` world units and the camera flies in world space. The COMPLEX
window (`win = {cx, cy, w}`, square, default center −0.6+0i, width 4.2) mapped
onto that extent is what the explorer zooms; the field is recomputed per window.
Camera zoom (dolly) and set zoom (window dive) are therefore independent.

**Architecture (two-stage function rendering):**

1. **Field stage (JavaScript, chunked with adaptive chunk sizing)** — escape
   iteration over the current complex window on a 512²/1024²/2048² grid.
   Iteration budget scales with depth: `maxiter = clamp(400 + 300·log10(4.2/w),
   400, 2500)`. The potential is stored in log space, `L = log2 φ =
   log2(ln|z|) − n`, because raw φ underflows IEEE doubles beyond ~10³⁰⁰ (deep
   zoom). Per window it is normalized `gn = 2^((L − Lref)/2)` with Lref = the
   98th percentile of exterior L — mathematically a rescale of √φ, i.e. an
   automatic β retune, so the landscape keeps the mesa-and-cliffs shape at
   every depth. Uploaded as an RG32F texture (R = normalized √φ, G = interior).
2. **Render stage (GLSL fragment shader, full-screen triangle)** — per-pixel ray
   march of the height field `h = HSCALE · exp(−β·√φ)` (manual bilinear texture
   sampling, growing step + 10-step bisection refinement), finite-difference
   normals, Lambert shading with warm sun / cool violet ambient, optional
   shadow march, black interior "lake", analytic sphere intersection, sunset-
   gradient sky, and distance fog colored exactly like the horizon so far
   terrain melts into the sky. Post: gamma 1/1.6 + optional CRT scanlines.

**Interaction model:** orbit camera (yaw/pitch/distance around a target) with
drag; wheel/pinch zoom; right-drag or shift-drag pan (clamped to the world
extent); camera-terrain collision guard (CPU-side bilinear height sampler);
render-on-demand (dirty flag) so the GPU idles when nothing changes.

**Set-zoom (Region) system:** a Region panel with a 192² minimap (top-down
render of the field through a sunset colormap, rebuilt after every field
compute; click recenters the window), Re/Im/width/zoom readouts with
depth-adaptive precision, Zoom ×2 / ÷2 buttons, a dive-history Back stack, and
Reset region. Double-clicking a terrain point dives ×2 into the set at that
point: a CPU raycast mirroring the shader's march recovers the world hit,
converts it to complex coordinates, recenters the window there and re-targets
the camera to the world origin. Dive depth is capped at window width 10⁻¹²
(double-precision limit — beyond this perturbation arithmetic would be needed).

**User controls:** moon-sphere toggle, sphere position X/Y and terrain-relative
altitude (the sphere's rest height is re-sampled from the CPU-side field
whenever position, altitude, or β changes), cast-shadow toggle, CRT-scanline
toggle, sun azimuth (0–360°), sun elevation (3–85°), sun intensity, cliff
steepness β (2.5–8, live uniform — the field texture stores √φ so β needs no
recompute), grid resolution (1024/2048, recomputes the field), reset view.

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
