import type { FieldStore } from './fieldStore';

// minimap colormap: sunset palette, bright near the set
const STOPS: [number, number, number, number][] = [
  [0, 238, 236, 242],
  [0.35, 255, 140, 40],
  [0.8, 120, 25, 8],
  [1.4, 15, 6, 8],
];

function ramp(gn: number): [number, number, number] {
  if (gn <= 0) return [STOPS[0][1], STOPS[0][2], STOPS[0][3]];
  for (let s = 1; s < STOPS.length; s++) {
    if (gn <= STOPS[s][0]) {
      const f = (gn - STOPS[s - 1][0]) / (STOPS[s][0] - STOPS[s - 1][0]);
      return [
        STOPS[s - 1][1] + (STOPS[s][1] - STOPS[s - 1][1]) * f,
        STOPS[s - 1][2] + (STOPS[s][2] - STOPS[s - 1][2]) * f,
        STOPS[s - 1][3] + (STOPS[s][3] - STOPS[s - 1][3]) * f,
      ];
    }
  }
  return [15, 6, 8];
}

/** Top-down render of the current field into the minimap canvas. */
export function buildMinimap(canvas: HTMLCanvasElement, field: FieldStore): void {
  const data = field.data;
  if (!data) return;
  const mm = canvas.width, n = field.n;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = ctx.createImageData(mm, mm);
  for (let m = 0; m < mm; m++) {
    const j = Math.round((1 - (m + 0.5) / mm) * (n - 1));   // Im axis points up
    for (let i2 = 0; i2 < mm; i2++) {
      const i = Math.round(((i2 + 0.5) / mm) * (n - 1));
      const k = (j * n + i) * 2, o = (m * mm + i2) * 4;
      const c = data[k + 1] > 0.5 ? [5, 5, 8] : ramp(data[k]);
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}
