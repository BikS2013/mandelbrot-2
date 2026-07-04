# Investigation: Reproducing the "Mandelbrot Potential Landscape" via Function Rendering

**Status:** validated with a working proof-of-concept
**Reference image:** `original-mandelbrot-potential-landscape.png` (this folder)
**PoC result:** `poc-potential-landscape-render.png` (this folder)
**PoC script:** `test_scripts/poc_potential_landscape.py` (project root)

---

## 1. What the picture is

The reference image is one of the most famous fractal artworks ever made: a **3D
"potential landscape" of the Mandelbrot set**. The genre was invented by the
Bremen group of Heinz-Otto Peitgen and Peter H. Richter; the first published
example was the cover of *Scientific American*, August 1985, and the style was
developed further in their book *The Beauty of Fractals* (Springer, 1986) and in
*The Science of Fractal Images* (Peitgen & Saupe eds., Springer, 1988), where the
underlying algorithm is documented as **CPM/M — the Continuous Potential Method
for the Mandelbrot set** (alongside LSM/M, the Level Set Method, and DEM/M, the
Distance Estimator Method).

The key artistic idea, as documented for the 1985 cover: the potential function
grows fast near the boundary of the set, so the landscape is grown **downwards**
— making the Mandelbrot set itself appear as a **flat black plateau on top of a
mountain with steep fractal cliffs**. The blue sphere is a purely decorative
scene element ("moon over Mandelbrot mountain"), the sky is a simple sunset
gradient, and the horizontal-line texture of the reference scan comes from
photographing a CRT monitor (these images predate framebuffer file output being
practical to print).

### Scene decomposition of the reference image

| Element | What it actually is |
|---|---|
| White mountainous terrain | Height field of the (inverted) Douady–Hubbard potential of the M-set exterior |
| Black "lake" in the plateau | The Mandelbrot set interior itself (potential = 0), rendered flat black |
| Needle spikes along cliff edges | The set's external filaments ("hairs"), thinner than one grid cell — deliberate aliasing |
| Rolling white domes | The smooth potential skirt around the cardioid and bulbs |
| Dark pools on the plateau | Cast shadows from a low sun + cool (violet) ambient light |
| Blue sphere | An analytic sphere primitive composited into the same scene, resting on a summit |
| Orange/black sky | 1D vertical gradient (sunset), horizon glow doubles as distance fog |
| Fine horizontal lines | CRT photograph artifact (reproduce with a scanline overlay in post) |

## 2. The function to render

Everything in the terrain derives from **one scalar function** of a complex
point c — this is why the picture is a textbook case of *function rendering*
(no modeled geometry; the surface IS the function graph).

### 2.1 Douady–Hubbard potential (Green's function)

For the iteration `z₀ = 0, z_{n+1} = z_n² + c`, the potential of the exterior is

```
φ(c) = lim_{n→∞}  log|z_n| / 2ⁿ        (φ = 0 on / inside the set)
```

Practical computation (CPM/M): iterate until `|z_n| > R` for a **large** bailout
(R = 10¹⁰ in the PoC; a big R makes φ smooth across level-set boundaries), then

```
φ(c) ≈ log|z_n| / 2ⁿ
```

Points that never escape within `maxiter` are interior → φ = 0, flagged in an
interior mask (used to paint the black lake).

### 2.2 Height mapping (the "grow downwards" trick)

φ increases away from the set (φ ≈ log|c| far away, → 0 at the boundary), so a
**decreasing** map of φ puts the set on top:

```
h(c) = exp(−β · √φ(c))      interior → h = 1  (plateau)
```

- `√φ` softens the profile so the plateau shows gentle rolling domes near the
  bulbs instead of a razor-flat top.
- `β` controls where the cliffs fall and how steep they are (PoC: β = 4.8).
- Because equipotential lines crowd exponentially near the boundary, any such
  map automatically produces near-vertical cliff walls — that is a property of
  the mathematics, not a rendering trick.
- The filaments carry `φ ≈ 0` (high terrain) out into low surroundings; sampled
  on a finite grid they become one-cell-wide ridges → the characteristic
  needle spikes. **Do not anti-alias them away — they are the look.**

World scale: the terrain height is `H(x,y) = h · HSCALE` over the complex-plane
window; PoC uses HSCALE = 0.55 with the plane spanning ≈ 4 units.

## 3. Validated reproduction pipeline (the PoC)

The recipe below was implemented and verified in
`test_scripts/poc_potential_landscape.py` (Python + numpy + Pillow only,
~50 s for a 1600² render on this machine). Side-by-side, the PoC reproduces
every structural element of the reference image.

1. **Field pass** — 2048² grid over `Re ∈ [−2.7, 1.5], Im ∈ [−2.1, 2.1]`,
   vectorized escape iteration (maxiter 400, bailout 10¹⁰) → `φ`, interior
   mask → height texture `H` + precomputed gradients (`np.gradient`) for
   normals.
2. **Camera** — perspective pinhole at `(1.75, −1.75, 1.40)` looking at
   `(−0.90, 0.40, 0.30)`, FOV 56°. This viewpoint (from the lower-right of the
   plane, slightly above plateau height) yields the original's composition:
   set silhouette center-right with the antenna toward the upper-left,
   foreground flank at the bottom, cliffs melting into the horizon.
3. **Terrain intersection** — lock-step ray march of all rays against the
   bilinear-interpolated height field (`Δt = 0.0035·(1+t)`), 10 bisection steps
   to refine each hit. (The 1986 originals used the equivalent scanline
   "floating horizon" painter's algorithm instead; any height-field renderer
   works.)
4. **Shading** — Lambert with normals `(−∂H/∂x, −∂H/∂y, 1)`; warm sun from
   `(0.55, 0.55, 0.30)` (low, upper-right); cool violet ambient
   `(0.22, 0.20, 0.30)` → the signature violet shadow pools; **cast shadows**
   by a second, coarser march from each hit point toward the sun.
   Interior-mask hits are painted near-black (the lake).
5. **Sphere** — analytic ray–sphere intersection, depth-compared against the
   terrain hit; Lambert + slight rim light; blue-violet albedo
   `(0.46, 0.47, 0.78)`; rested on the ridge near the antenna
   (center `(−1.75, 0.08)`, r = 0.22, sunk 25 % into the terrain).
6. **Sky & fog** — vertical gradient black → maroon → deep red → orange keyed
   on ray elevation; distance fog `1 − exp(−0.008·t³)` whose color **equals the
   horizon color**, so far terrain melts into the sunset and mid-distance peaks
   silhouette against "sky" exactly as in the original.
7. **Post** — gamma 1/1.6, Lanczos downsample 1600 → 1000, 0.5 px blur, every
   third row darkened 6 % (CRT scanline look).

### What still differs from the original (tuning knobs)

- **Composition/zoom** — the original shows a bit more plateau margin around
  the lake and taller spike towers at the right edge; pure camera placement
  (move higher/farther, aim slightly more toward +y) and window choice.
- **Terrace richness** — the original's flanks show more stepped filament
  terraces; increase the field grid (4096²) and tune β, or use
  `h = exp(−β·φ^α)` with α ≈ 0.35–0.45 to trade plateau-dome softness against
  cliff placement.
- **Shadow softness / print grain** — the original's shadows are softer
  (photographic diffusion); add multi-sample sun jitter and film grain in post.

## 4. Alternative rendering routes (compared)

| Route | Effort | Fidelity | Notes |
|---|---|---|---|
| **A. Authentic 1986 scanline** (paint grid rows back-to-front, "floating horizon") | Low | High (period-correct) | Simplest possible renderer; exactly what the originals used; no ray casting needed |
| **B. CPU ray-marched height field (the PoC)** | Medium | High | Full control (shadows, fog, sphere); ~1 min/frame in numpy; validated here |
| **C. GLSL / Shadertoy fragment shader** | Medium | High, real-time | Same math on GPU; compute φ per-sample or from a texture; enables interactive camera flights |
| **D. Blender/Cycles displacement** | Low code, high tooling | Photoreal+ | Export the height texture as 16-bit PNG, displace a subdivided plane, add sphere + sun + gradient world; global illumination for free, but drifts from the period look |

Recommendation: **B or C** for a faithful, fully procedural reproduction
("function rendering" end to end); **A** if period authenticity of the
algorithm itself matters; **D** if a modern glossy variant is wanted.

> **Update 2026-07-04:** route C has been implemented as an interactive WebGL2
> viewer — `web/mandelbrot-landscape-interactive.html` (orbit/zoom/pan camera,
> optional sphere, user-controlled sun, live cliff-steepness). See
> `docs/design/project-design.md` for its architecture.

## 5. Sources

- [Fractal art — Wikipedia](https://en.wikipedia.org/wiki/Fractal_art) (history of the Aug-1985 *Scientific American* cover: potential landscape grown downwards, set as plateau; same technique used in *The Beauty of Fractals*)
- [Peitgen & Richter, *The Beauty of Fractals*, Springer 1986](http://link.springer.com/content/pdf/10.1007/978-3-642-61717-1.pdf)
- [A. Chéritat — Techniques for computer generated pictures in complex dynamics (Mandelbrot set)](https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set)
- [3D representation of the Mandelbrot set — *The Visual Computer*](https://link.springer.com/article/10.1007/BF01900831)
- [Use of potential functions in 3D rendering of fractal images — *The Visual Computer*](https://link.springer.com/article/10.1007/BF01782319)
- Peitgen & Saupe (eds.), *The Science of Fractal Images*, Springer 1988 — algorithms LSM/M, CPM/M, DEM/M

## 6. Process notes

- PoC developed in the session scratchpad under a uv-managed venv
  (`uv init` + `uv add numpy pillow`); note that on this machine the shell
  aliases `python` to Homebrew Python, so scripts must be run with
  `uv run python …` (plain `source .venv/bin/activate && python` silently uses
  the wrong interpreter).
- The PoC is a study artifact, not a project tool. If a reusable
  terrain-rendering tool should grow out of this, it must go through the
  tool-conventions flow (TypeScript, `docs/tools/`, `~/.tool-agents/`) per the
  workspace instructions.
