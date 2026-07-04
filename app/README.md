# Mandelbrot Landscape Explorer

Real-time WebGL recreation of the classic Peitgen–Richter "potential landscape"
rendering of the Mandelbrot set (the August-1985 *Scientific American* cover /
*The Beauty of Fractals* style) — extended into an interactive explorer that
dives into the set itself.

TypeScript + Vite, **zero runtime dependencies**. The build output is a fully
static site: host it on any web server (nginx, GitHub Pages, S3, `npx serve`) —
no backend, no external assets, no claude.ai artifact needed.

## Quick start

```bash
npm install
npm run dev        # dev server with HMR, http://localhost:5173
```

## Build & self-host

```bash
npm run build      # typechecks (tsc --noEmit) then bundles to dist/
npm run preview    # serve dist/ locally to sanity-check the build
```

Deploy by copying `dist/` to any static host. The build uses relative asset
paths (`base: './'`), so it works from a subdirectory too.

## Controls

| Control | Effect |
|---|---|
| drag | orbit the camera |
| wheel / pinch | camera zoom (dolly) |
| right-drag / shift-drag | pan the camera target |
| **double-click terrain** | **dive ×2 into the set at that point** |
| Region panel | minimap (click to recenter), Re/Im/width/zoom readouts, Zoom ×2 / ÷2, Back (dive history), Reset region |
| Scene | moon sphere, cast shadows, CRT scanlines toggles |
| Sphere | position X/Y and altitude above the terrain resting point |
| Light | sun azimuth / elevation / intensity |
| Terrain | cliff steepness (live), field grid 512²–2048² |

## How it works

Two-stage *function rendering* — no modeled geometry, the terrain **is** the
Douady–Hubbard potential φ of the Mandelbrot set's exterior:

1. **Field stage** (`field.worker.ts`, off the main thread): escape-time
   iteration over the current complex window. The potential is stored in log
   space, `L = log2 φ = log2(ln|z|) − n`, because raw φ underflows IEEE doubles
   at deep zoom; per window it is normalized `gn = 2^((L − Lref)/2)` against the
   98th-percentile Lref — mathematically a rescale of √φ (an automatic
   steepness retune), so the landscape keeps its mesa-and-cliffs shape at every
   depth. Iterations scale with depth: 400 → 2500.
2. **Render stage** (`shaders.ts`, WebGL2 fragment shader): per-pixel ray march
   of the height field `h = 0.55·exp(−β·gn)` with Lambert shading, cast-shadow
   march, black interior "lake", analytic moon sphere, sunset-gradient sky, and
   distance fog colored exactly like the horizon (that is what melts far
   terrain into the sunset). World space is fixed at [−2.1, 2.1]²; the complex
   window mapped onto it is what the explorer zooms, so camera zoom and set
   zoom stay independent.

**Depth limit:** window width 10⁻¹² (≈ ×4·10¹² zoom) — the IEEE-double
per-pixel resolution floor. Deeper would require perturbation arithmetic.

## Module map

```
src/
  main.ts          glue: render loop, recompute pipeline, dive wiring
  state.ts         mutable app state (params, camera, window, dirty flag)
  constants.ts     world/scene constants, maxiter policy
  types.ts         shared interfaces
  field.worker.ts  escape iteration + L-space normalization (Web Worker)
  fieldStore.ts    field ownership, CPU bilinear samplers (collision, raycast)
  renderer.ts      WebGL2 setup, RG32F field texture, draw call
  shaders.ts       GLSL vertex/fragment sources
  camera.ts        orbit camera, pointer/wheel/pinch/dive interactions
  minimap.ts       top-down field render for the Region panel
  ui.ts            control panel + region (set-zoom) logic + overlay
```

## Provenance

Reproduction study and the original reference image live in
`../docs/reference/` (see
`investigation-mandelbrot-potential-landscape-rendering.md`). A dependency-free
single-file prototype of the same app is kept at
`../web/mandelbrot-landscape-interactive.html`.
