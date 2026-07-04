import { DEFAULT_CAM, DEFAULT_WIN, MAX_W, MIN_W, clamp } from './constants';
import type { FieldStore } from './fieldStore';
import { cam, params, win, winStack } from './state';

export interface UiHooks {
  recompute(): void;
  markDirty(): void;
  field: FieldStore;
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`missing element #${id}`);
  return node as T;
}

// ---------------------------------------------------------------- overlay
const overlay = el<HTMLDivElement>('overlay');
const overlayTitle = overlay.querySelector('b') as HTMLElement;
const progEl = el<HTMLProgressElement>('prog');
const pctEl = el<HTMLSpanElement>('pct');

export function showOverlay(text: string): void {
  overlayTitle.textContent = text;
  progEl.value = 0;
  pctEl.textContent = '0%';
  overlay.classList.remove('hidden');
}
export function setProgress(f: number): void {
  progEl.value = f;
  pctEl.textContent = `${Math.round(100 * f)}%`;
}
export function hideOverlay(): void { overlay.classList.add('hidden'); }
export function showFatal(html: string): void {
  overlay.classList.remove('hidden');
  (overlay.querySelector('.card') as HTMLElement).innerHTML = html;
}

// ---------------------------------------------------------------- region
const roRe = el<HTMLSpanElement>('roRe');
const roIm = el<HTMLSpanElement>('roIm');
const roW = el<HTMLSpanElement>('roW');
const roZ = el<HTMLSpanElement>('roZ');
const btnIn = el<HTMLButtonElement>('zin');
const btnOut = el<HTMLButtonElement>('zout');
const btnBack = el<HTMLButtonElement>('zback');
const btnRegionReset = el<HTMLButtonElement>('zreset');
const mini = el<HTMLCanvasElement>('minimap');

function fmtCoord(v: number): string {
  const d = Math.max(5, Math.min(15, Math.ceil(-Math.log10(win.w)) + 4));
  return v.toFixed(d);
}

export function refreshRegionUI(): void {
  roRe.textContent = fmtCoord(win.cx);
  roIm.textContent = fmtCoord(win.cy);
  roW.textContent = win.w >= 0.01 ? win.w.toFixed(4) : win.w.toExponential(2);
  const z = 4.2 / win.w;
  roZ.textContent = `×${z < 1000 ? String(Math.round(z * 10) / 10) : z.toExponential(1)}`;
  btnBack.disabled = winStack.length === 0;
  btnOut.disabled = win.w >= MAX_W;
  btnIn.disabled = win.w <= MIN_W;
}

// ---------------------------------------------------------------- setup
export function setupUI(hooks: UiHooks): { setWindow(cx: number, cy: number, w: number): void } {
  const { field } = hooks;

  function setWindow(cx: number, cy: number, w: number): void {
    if (field.computing) return;
    winStack.push({ ...win });
    win.cx = cx;
    win.cy = cy;
    win.w = clamp(w, MIN_W, MAX_W);
    hooks.recompute();
  }

  btnIn.addEventListener('click', () => setWindow(win.cx, win.cy, win.w / 2));
  btnOut.addEventListener('click', () => setWindow(win.cx, win.cy, win.w * 2));
  btnBack.addEventListener('click', () => {
    if (field.computing) return;
    const prev = winStack.pop();
    if (prev) { Object.assign(win, prev); hooks.recompute(); }
  });
  btnRegionReset.addEventListener('click', () => {
    if (field.computing) return;
    winStack.length = 0;
    Object.assign(win, DEFAULT_WIN);
    hooks.recompute();
  });
  mini.addEventListener('click', (e) => {
    if (field.computing || !field.data) return;
    const r = mini.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    setWindow(win.cx + (fx - 0.5) * win.w, win.cy + (0.5 - fy) * win.w, win.w);
  });

  // -------------------------------------------------------------- scene
  function bindCheck(id: string, key: 'sphere' | 'shadows' | 'crt'): void {
    const box = el<HTMLInputElement>(id);
    box.addEventListener('change', () => {
      params[key] = box.checked;
      hooks.markDirty();
    });
  }
  bindCheck('sphereOn', 'sphere');
  bindCheck('shadowsOn', 'shadows');
  bindCheck('crtOn', 'crt');

  // sphere position/height controls follow the sphere toggle
  const sphereInputs = ['sphX', 'sphY', 'sphAlt'].map((id) => el<HTMLInputElement>(id));
  const sphereSec = el<HTMLElement>('sphereSec');
  function syncSphereUI(): void {
    sphereInputs.forEach((input) => { input.disabled = !params.sphere; });
    sphereSec.style.opacity = params.sphere ? '' : '0.45';
  }
  el<HTMLInputElement>('sphereOn').addEventListener('change', syncSphereUI);
  syncSphereUI();

  // -------------------------------------------------------------- sliders
  function bindRange(
    id: string,
    key: 'az' | 'el' | 'sunI' | 'beta' | 'sphX' | 'sphY' | 'sphAlt',
    fmt: (v: string) => string,
  ): void {
    const input = el<HTMLInputElement>(id);
    const out = el<HTMLOutputElement>(`${id}V`);
    input.addEventListener('input', () => {
      params[key] = parseFloat(input.value);
      out.textContent = fmt(input.value);
      hooks.markDirty();
    });
  }
  bindRange('sphX', 'sphX', (v) => parseFloat(v).toFixed(2));
  bindRange('sphY', 'sphY', (v) => parseFloat(v).toFixed(2));
  bindRange('sphAlt', 'sphAlt', (v) => (parseFloat(v) >= 0 ? '+' : '') + parseFloat(v).toFixed(2));
  bindRange('az', 'az', (v) => `${v}°`);
  bindRange('el', 'el', (v) => `${v}°`);
  bindRange('sunI', 'sunI', (v) => parseFloat(v).toFixed(2));
  bindRange('beta', 'beta', (v) => parseFloat(v).toFixed(1));

  // -------------------------------------------------------------- misc
  el<HTMLSelectElement>('grid').addEventListener('change', (e) => {
    params.grid = parseInt((e.target as HTMLSelectElement).value, 10);
    if (!field.computing) hooks.recompute();
  });
  el<HTMLButtonElement>('reset').addEventListener('click', () => {
    Object.assign(cam, DEFAULT_CAM);
    hooks.markDirty();
  });

  refreshRegionUI();
  return { setWindow };
}
