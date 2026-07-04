# Project Functions & Features

## F1 — Potential-landscape reproduction recipe (done)
Study documenting how the classic Peitgen–Richter Mandelbrot potential landscape
is produced (CPM/M potential → inverted height field → shaded terrain render),
validated by an offline Python PoC.
Artifacts: `docs/reference/investigation-mandelbrot-potential-landscape-rendering.md`,
`test_scripts/poc_potential_landscape.py`, `docs/reference/poc-potential-landscape-render.png`.

## F2 — Interactive real-time viewer (done)
`web/mandelbrot-landscape-interactive.html` (WebGL2, self-contained).

- **F2.1 Rotate / zoom / pan** — drag orbits the camera, wheel or pinch zooms,
  right-drag / shift-drag pans; camera cannot go below the terrain; Reset view
  restores the reference composition.
- **F2.2 Optional sphere** — the decorative "moon" sphere is toggled by a
  checkbox; it rests on the terrain and re-seats itself when cliff steepness
  changes.
- **F2.3 User-controlled lighting** — sun azimuth (0–360°), elevation (3–85°)
  and intensity sliders update shading and cast shadows live; shadows can be
  toggled off for slower GPUs.
- **F2.4 Terrain controls** — cliff-steepness slider (live), field grid
  resolution select (1024²/2048², recomputes with progress overlay).
- **F2.5 Period look** — optional CRT-scanline post effect, sunset-gradient sky
  and horizon fog matching the 1985/86 originals.
