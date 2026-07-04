import { DEFAULT_CAM, DEFAULT_WIN, WORLD_SIZE } from './constants';
import type { CameraState, ComplexWindow, Params } from './types';

export const params: Params = {
  sphere: true, shadows: true, crt: true,
  az: 45, el: 21, sunI: 1.05, beta: 4.8, grid: 1024,
  sphX: -1.15, sphY: 0.08, sphAlt: 0,
};

export const cam: CameraState = { ...DEFAULT_CAM };

export const win: ComplexWindow = { ...DEFAULT_WIN };
export const winStack: ComplexWindow[] = [];

export function worldToComplex(wx: number, wy: number): [number, number] {
  return [win.cx + wx * (win.w / WORLD_SIZE), win.cy + wy * (win.w / WORLD_SIZE)];
}

let dirty = true;
export function markDirty(): void { dirty = true; }
export function consumeDirty(): boolean {
  const d = dirty;
  dirty = false;
  return d;
}
