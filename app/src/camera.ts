import { FOV_TAN, WORLD_MAX, WORLD_MIN, clamp } from './constants';
import type { FieldStore } from './fieldStore';
import { cam } from './state';
import type { CamBasis } from './types';

/** Orbit-camera basis vectors, with a terrain collision guard. */
export function camVectors(field: FieldStore): CamBasis {
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const px = cam.tx + cam.dist * cp * cy;
  const py = cam.ty + cam.dist * cp * sy;
  let pz = cam.tz + cam.dist * sp;
  if (field.data) pz = Math.max(pz, field.height(px, py) + 0.04);
  const f: [number, number, number] = [cam.tx - px, cam.ty - py, cam.tz - pz];
  const fl = Math.hypot(f[0], f[1], f[2]);
  f[0] /= fl; f[1] /= fl; f[2] /= fl;
  const r: [number, number, number] = [f[1], -f[0], 0];
  const rl = Math.hypot(r[0], r[1]) || 1;
  r[0] /= rl; r[1] /= rl;
  const u: [number, number, number] = [
    r[1] * f[2],
    -r[0] * f[2],
    r[0] * f[1] - r[1] * f[0],
  ];
  return { pos: [px, py, pz], fwd: f, right: r, up: u };
}

/** CPU raycast mirroring the shader's terrain march — world hit or null. */
export function raycastTerrain(
  field: FieldStore, canvas: HTMLCanvasElement, clientX: number, clientY: number,
): [number, number] | null {
  const rect = canvas.getBoundingClientRect();
  const sx = (((clientX - rect.left) / rect.width) * 2 - 1) * (rect.width / rect.height);
  const sy = -((((clientY - rect.top) / rect.height) * 2) - 1);
  const v = camVectors(field);
  const d: [number, number, number] = [
    v.fwd[0] + FOV_TAN * (sx * v.right[0] + sy * v.up[0]),
    v.fwd[1] + FOV_TAN * (sx * v.right[1] + sy * v.up[1]),
    v.fwd[2] + FOV_TAN * (sx * v.right[2] + sy * v.up[2]),
  ];
  const dl = Math.hypot(d[0], d[1], d[2]);
  d[0] /= dl; d[1] /= dl; d[2] /= dl;
  let t = 0.02, tPrev = 0.02, hitT = -1;
  for (let i = 0; i < 900; i++) {
    const px = v.pos[0] + d[0] * t, py = v.pos[1] + d[1] * t, pz = v.pos[2] + d[2] * t;
    if (pz < field.height(px, py)) { hitT = t; break; }
    if (t > 12) break;
    tPrev = t;
    t += 0.004 * (1 + t);
  }
  if (hitT < 0) return null;
  let lo = tPrev, hi = hitT;
  for (let i = 0; i < 10; i++) {
    const m = 0.5 * (lo + hi);
    if (v.pos[2] + d[2] * m < field.height(v.pos[0] + d[0] * m, v.pos[1] + d[1] * m)) hi = m;
    else lo = m;
  }
  const tf = 0.5 * (lo + hi);
  return [v.pos[0] + d[0] * tf, v.pos[1] + d[1] * tf];
}

export interface CameraHooks {
  markDirty(): void;
  onDive(clientX: number, clientY: number): void;
}

/** Orbit / zoom / pan / pinch / dive interactions. */
export function attachCameraControls(
  canvas: HTMLCanvasElement, field: FieldStore, hooks: CameraHooks,
): void {
  const pointers = new Map<number, { x: number; y: number }>();
  let panMode = false;

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    panMode = e.button === 2 || e.shiftKey;
    canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointerup', (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) canvas.classList.remove('dragging');
  });
  canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); });

  canvas.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;

    if (pointers.size === 2) {                       // pinch zoom
      const ids = [...pointers.keys()];
      const other = pointers.get(ids[0] === e.pointerId ? ids[1] : ids[0]);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!other) return;
      const d0 = Math.hypot(prev.x - other.x, prev.y - other.y);
      const d1 = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      if (d0 > 0 && d1 > 0) {
        cam.dist = clamp((cam.dist * d0) / d1, 0.35, 9);
        hooks.markDirty();
      }
      return;
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (panMode) {
      const v = camVectors(field);
      const k = cam.dist * 0.0011;
      const ff: [number, number] = [v.fwd[0], v.fwd[1]];
      const fl = Math.hypot(ff[0], ff[1]) || 1;
      ff[0] /= fl; ff[1] /= fl;
      cam.tx += -v.right[0] * dx * k + ff[0] * dy * k;
      cam.ty += -v.right[1] * dx * k + ff[1] * dy * k;
      cam.tx = clamp(cam.tx, WORLD_MIN, WORLD_MAX);
      cam.ty = clamp(cam.ty, WORLD_MIN, WORLD_MAX);
    } else {
      cam.yaw -= dx * 0.005;
      cam.pitch = clamp(cam.pitch + dy * 0.005, 0.05, 1.45);
    }
    hooks.markDirty();
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    cam.dist = clamp(cam.dist * Math.exp(e.deltaY * 0.0012), 0.35, 9);
    hooks.markDirty();
  }, { passive: false });

  canvas.addEventListener('dblclick', (e) => hooks.onDive(e.clientX, e.clientY));
}
