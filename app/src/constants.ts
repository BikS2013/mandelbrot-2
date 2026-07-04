import type { CameraState, ComplexWindow } from './types';

// WORLD space is fixed: the terrain always spans [-2.1, 2.1]^2 world units and
// the camera flies in world space. The COMPLEX window mapped onto it is what
// the explorer zooms — the field is recomputed per window.
export const WORLD_MIN = -2.1;
export const WORLD_MAX = 2.1;
export const WORLD_SIZE = WORLD_MAX - WORLD_MIN;

export const HSCALE = 0.55;                       // terrain height, world units
export const SPH_R = 0.22;                        // sphere radius, world units
export const FOV_TAN = Math.tan((28 * Math.PI) / 180); // vertical half-FOV

export const MIN_W = 1e-12;                       // double-precision dive limit
export const MAX_W = 4.2;

export const DEFAULT_WIN: ComplexWindow = { cx: -0.6, cy: 0.0, w: 4.2 };
export const DEFAULT_CAM: CameraState = {
  yaw: -0.682, pitch: 0.313, dist: 3.577, tx: -0.30, ty: 0.40, tz: 0.30,
};

export function maxiterFor(w: number): number {
  return Math.max(400, Math.min(2500, Math.round(400 + 300 * Math.log10(4.2 / w))));
}

export function clamp(x: number, a: number, b: number): number {
  return Math.min(Math.max(x, a), b);
}
