import type { WorkerRequest, WorkerResponse } from './types';

const BAIL2 = 1e20;

function post(msg: WorkerResponse, transfer?: Transferable[]): void {
  postMessage(msg, { transfer });
}

self.onmessage = (e: MessageEvent) => {
  const { n, cx, cy, w, maxiter } = e.data as WorkerRequest;
  const data = new Float32Array(n * n * 2);
  const xmin = cx - w / 2, ymin = cy - w / 2, step = w / (n - 1);

  for (let j = 0; j < n; j++) {
    const ci = ymin + step * j;
    for (let i = 0; i < n; i++) {
      const cr = xmin + step * i;
      let zr = 0, zi = 0, it = 0, r2 = 0;
      while (it < maxiter) {
        const t = zr * zr - zi * zi + cr;
        zi = 2 * zr * zi + ci;
        zr = t;
        it++;
        r2 = zr * zr + zi * zi;
        if (r2 > BAIL2) break;
      }
      const k = (j * n + i) * 2;
      // store L = log2(phi) — raw phi underflows doubles at deep zoom
      if (r2 > BAIL2) {
        data[k] = Math.log2(0.5 * Math.log(r2)) - it;
        data[k + 1] = 0;
      } else {
        data[k] = 0;
        data[k + 1] = 1;
      }
    }
    if (j % 16 === 0) post({ type: 'progress', done: j / n });
  }

  // Per-window normalization in L-space: gn = 2^((L-Lref)/2) = sqrt(phi)/ref.
  // Rescaling sqrt(phi) is equivalent to auto-tuning beta, so the landscape
  // keeps its mesa-and-cliffs shape at every zoom depth.
  const sample: number[] = [];
  for (let k = 0; k < n * n; k += 8) if (data[k * 2 + 1] < 0.5) sample.push(data[k * 2]);
  sample.sort((a, b) => a - b);
  const lref = sample.length
    ? sample[Math.min(sample.length - 1, Math.floor(sample.length * 0.98))]
    : 0;
  for (let k = 0; k < n * n; k++) {
    if (data[k * 2 + 1] < 0.5) {
      data[k * 2] = Math.min(Math.pow(2, (data[k * 2] - lref) / 2), 8);
    }
  }

  post({ type: 'result', data, n }, [data.buffer]);
};
