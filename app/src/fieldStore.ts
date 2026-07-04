import { HSCALE, SPH_R, WORLD_MIN, WORLD_MAX, maxiterFor } from './constants';
import { params } from './state';
import type { ComplexWindow, WorkerRequest, WorkerResponse } from './types';

/** Owns the computed potential field (normalized sqrt-phi + interior mask)
 *  and the worker that computes it. Also provides the CPU-side samplers used
 *  for camera-terrain collision, sphere seating, and the dive raycast. */
export class FieldStore {
  data: Float32Array | null = null;
  n = 0;
  computing = false;

  private worker = new Worker(new URL('./field.worker.ts', import.meta.url), { type: 'module' });

  compute(n: number, win: ComplexWindow, onProgress: (f: number) => void): Promise<void> {
    if (this.computing) return Promise.reject(new Error('field computation already running'));
    this.computing = true;
    return new Promise((resolve) => {
      this.worker.onmessage = (e: MessageEvent) => {
        const msg = e.data as WorkerResponse;
        if (msg.type === 'progress') {
          onProgress(msg.done);
        } else {
          this.data = msg.data;
          this.n = msg.n;
          this.computing = false;
          resolve();
        }
      };
      const req: WorkerRequest = { n, cx: win.cx, cy: win.cy, w: win.w, maxiter: maxiterFor(win.w) };
      this.worker.postMessage(req);
    });
  }

  /** Bilinear sample of the normalized sqrt-potential at a world point. */
  gAt(x: number, y: number): number {
    const d = this.data;
    if (!d) return 0;
    const n = this.n;
    let u = ((x - WORLD_MIN) / (WORLD_MAX - WORLD_MIN)) * (n - 1);
    let v = ((y - WORLD_MIN) / (WORLD_MAX - WORLD_MIN)) * (n - 1);
    u = Math.min(Math.max(u, 0), n - 1.001);
    v = Math.min(Math.max(v, 0), n - 1.001);
    const i = u | 0, j = v | 0, fu = u - i, fv = v - j;
    const g = (row: number, col: number): number => d[(row * n + col) * 2];
    return (g(j, i) * (1 - fu) + g(j, i + 1) * fu) * (1 - fv)
         + (g(j + 1, i) * (1 - fu) + g(j + 1, i + 1) * fu) * fv;
  }

  /** Terrain height (world units) at a world point, using the live beta. */
  height(x: number, y: number): number {
    return HSCALE * Math.exp(-params.beta * this.gAt(x, y));
  }

  /** Sphere center z: resting on the terrain, plus the user altitude offset. */
  sphereZ(): number {
    return this.height(params.sphX, params.sphY) + SPH_R * 0.75 + params.sphAlt;
  }
}
