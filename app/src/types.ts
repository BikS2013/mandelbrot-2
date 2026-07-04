export type Vec3 = [number, number, number];

export interface Params {
  sphere: boolean;
  shadows: boolean;
  crt: boolean;
  az: number;      // sun azimuth, degrees
  el: number;      // sun elevation, degrees
  sunI: number;    // sun intensity
  beta: number;    // cliff steepness on the normalized sqrt-potential
  grid: number;    // field grid resolution
  sphX: number;    // sphere position, world units
  sphY: number;
  sphAlt: number;  // sphere altitude above its terrain resting point
}

export interface CameraState {
  yaw: number;
  pitch: number;
  dist: number;
  tx: number;      // orbit target, world units
  ty: number;
  tz: number;
}

export interface ComplexWindow {
  cx: number;      // window center, complex plane
  cy: number;
  w: number;       // window width (square)
}

export interface CamBasis {
  pos: Vec3;
  fwd: Vec3;
  right: Vec3;
  up: Vec3;
}

export interface WorkerRequest {
  n: number;
  cx: number;
  cy: number;
  w: number;
  maxiter: number;
}

export type WorkerResponse =
  | { type: 'progress'; done: number }
  | { type: 'result'; data: Float32Array; n: number };
