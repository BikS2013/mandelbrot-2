import './style.css';
import { attachCameraControls, camVectors, raycastTerrain } from './camera';
import { maxiterFor } from './constants';
import { isTouchDevice } from './device';
import { FieldStore } from './fieldStore';
import { buildMinimap } from './minimap';
import { Renderer, type DrawInput } from './renderer';
import { cam, consumeDirty, markDirty, params, win, worldToComplex } from './state';
import {
  hideOverlay, refreshRegionUI, setProgress, setupUI, showFatal, showOverlay,
} from './ui';
import type { Vec3 } from './types';

if (isTouchDevice) document.documentElement.classList.add('touch');

const canvas = document.getElementById('gl') as HTMLCanvasElement;
const minimapCanvas = document.getElementById('minimap') as HTMLCanvasElement;

let renderer: Renderer;
try {
  renderer = new Renderer(canvas);
} catch (err) {
  showFatal(`<b>WebGL2 is required</b><br>${(err as Error).message}`);
  throw err;
}

const field = new FieldStore();

function recompute(): void {
  refreshRegionUI();
  showOverlay(
    `Computing potential field… ${params.grid} × ${params.grid} · ${maxiterFor(win.w)} iterations`,
  );
  void field.compute(params.grid, win, setProgress).then(() => {
    if (field.data) renderer.uploadField(field.data, field.n);
    buildMinimap(minimapCanvas, field);
    refreshRegionUI();
    hideOverlay();
    markDirty();
  });
}

const ui = setupUI({ recompute, markDirty, field });

attachCameraControls(canvas, field, {
  markDirty,
  onDive(clientX, clientY) {
    if (field.computing || !field.data) return;
    const hit = raycastTerrain(field, canvas, clientX, clientY);
    if (!hit) return;
    const [cRe, cIm] = worldToComplex(hit[0], hit[1]);
    cam.tx = 0;                       // the dived point becomes the new center
    cam.ty = 0;
    ui.setWindow(cRe, cIm, win.w / 2);
  },
});

function sunDir(): Vec3 {
  const azr = (params.az * Math.PI) / 180;
  const elr = (params.el * Math.PI) / 180;
  return [Math.cos(elr) * Math.cos(azr), Math.cos(elr) * Math.sin(azr), Math.sin(elr)];
}

function frame(): void {
  if (field.data && consumeDirty()) {
    const input: DrawInput = {
      basis: camVectors(field),
      sunDir: sunDir(),
      sunI: params.sunI,
      beta: params.beta,
      sphereOn: params.sphere,
      sphereX: params.sphX,
      sphereY: params.sphY,
      sphereZ: field.sphereZ(),
      shadows: params.shadows,
      crt: params.crt,
    };
    renderer.draw(input);
  }
  requestAnimationFrame(frame);
}

window.addEventListener('resize', markDirty);
requestAnimationFrame(frame);
recompute();
