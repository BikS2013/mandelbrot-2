# mandelbrot-2 — Mandelbrot Potential Landscape

Recreating the classic Peitgen–Richter "potential landscape" rendering of the
Mandelbrot set (SciAm Aug-1985 / *The Beauty of Fractals*, 1986) through pure
function rendering — and extending it into an interactive explorer.

| Piece | Where |
|---|---|
| **Self-hosted TypeScript app** (canonical) | `app/` — Vite + WebGL2, static build, see `app/README.md` |
| Single-file prototype (no build needed) | `web/mandelbrot-landscape-interactive.html` |
| Reproduction study + reference image | `docs/reference/` |
| Offline Python proof-of-concept | `test_scripts/poc_potential_landscape.py` |
| Design / feature docs | `docs/design/project-design.md`, `docs/design/project-functions.md` |

Quick start:

```bash
cd app && npm install && npm run dev
```
