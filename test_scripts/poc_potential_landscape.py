"""Proof-of-concept reproduction of the classic Mandelbrot 'potential landscape'
(Peitgen/Richter, The Beauty of Fractals 1986 / SciAm Aug-1985 cover style).

Pipeline: continuous potential field -> inverted height field -> vectorized
ray-marched terrain with Lambert shading + cast shadows -> sky gradient,
fog, decorative sphere -> CRT-style post.
"""

import numpy as np
from PIL import Image, ImageFilter

# ----------------------------- parameters ----------------------------------
# potential field
NX = NY = 2048
X0, X1 = -2.7, 1.5          # complex-plane window (Re)
Y0, Y1 = -2.1, 2.1          # (Im)
MAXITER = 400
BAILOUT = 1e10
BETA = 4.8                  # cliff steepness on sqrt(potential) scale
HSCALE = 0.55               # terrain height in world units (plane units)

# camera / image
RES = 1600                  # rendered square, downsampled
OUT = 1000
CAM = np.array([1.75, -1.75, 1.40])
TARGET = np.array([-0.90, 0.40, 0.30])
FOV_DEG = 56.0

# light
SUN = np.array([0.55, 0.55, 0.30])   # from upper right, low
SUN = SUN / np.linalg.norm(SUN)
SUN_COL = np.array([1.05, 1.00, 0.95])
AMB_COL = np.array([0.22, 0.20, 0.30])   # cool ambient -> violet shadows

# decorative sphere
SPH_C = np.array([-1.75, 0.08, 0.0])     # z set after terrain is known
SPH_R = 0.22
SPH_COL = np.array([0.46, 0.47, 0.78])

# ----------------------------- potential field ------------------------------
print("computing potential field ...")
xs = np.linspace(X0, X1, NX)
ys = np.linspace(Y0, Y1, NY)
C = xs[None, :] + 1j * ys[:, None]
Z = np.zeros_like(C)
phi = np.zeros(C.shape)
alive = np.ones(C.shape, bool)
for n in range(1, MAXITER + 1):
    Z[alive] = Z[alive] ** 2 + C[alive]
    esc = alive & (np.abs(Z) > BAILOUT)
    if esc.any():
        phi[esc] = np.log(np.abs(Z[esc])) / 2.0 ** n
    alive &= ~esc
interior = alive.astype(np.float32)

# inverted-potential height: set = plateau at h=1, cliffs fall away outside
h = np.exp(-BETA * np.sqrt(phi)).astype(np.float32)
h[alive] = 1.0

# world-scale height + gradients for normals
H = h * HSCALE
dy, dx = np.gradient(H, ys[1] - ys[0], xs[1] - xs[0])
H = H.astype(np.float32); dx = dx.astype(np.float32); dy = dy.astype(np.float32)

def bilinear(grid, x, y):
    u = np.clip((x - X0) / (X1 - X0) * (NX - 1), 0, NX - 1.001)
    v = np.clip((y - Y0) / (Y1 - Y0) * (NY - 1), 0, NY - 1.001)
    i0 = u.astype(np.int32); j0 = v.astype(np.int32)
    fu = (u - i0).astype(np.float32); fv = (v - j0).astype(np.float32)
    g00 = grid[j0, i0]; g01 = grid[j0, i0 + 1]
    g10 = grid[j0 + 1, i0]; g11 = grid[j0 + 1, i0 + 1]
    return (g00 * (1 - fu) + g01 * fu) * (1 - fv) + (g10 * (1 - fu) + g11 * fu) * fv

def terrain_h(x, y):
    return bilinear(H, x, y)

# place the sphere resting on the terrain
SPH_C[2] = float(terrain_h(np.array([SPH_C[0]]), np.array([SPH_C[1]]))[0]) + SPH_R * 0.75
print("sphere at", SPH_C)

# ----------------------------- rays -----------------------------------------
print("building rays ...")
fwd = TARGET - CAM; fwd = fwd / np.linalg.norm(fwd)
right = np.cross(fwd, [0.0, 0.0, 1.0]); right = right / np.linalg.norm(right)
upv = np.cross(right, fwd)
half = np.tan(np.radians(FOV_DEG) / 2)
px = np.linspace(-half, half, RES, dtype=np.float32)
sx, sy = np.meshgrid(px, -px)          # screen y downwards
D = (fwd[None, None, :] + sx[..., None] * right[None, None, :]
     + sy[..., None] * upv[None, None, :])
D = (D / np.linalg.norm(D, axis=-1, keepdims=True)).reshape(-1, 3).astype(np.float32)
NRAY = D.shape[0]
ORIG = CAM.astype(np.float32)

# ----------------------------- sphere intersection --------------------------
oc = ORIG - SPH_C.astype(np.float32)
b = D @ oc.astype(np.float32)
disc = b * b - (oc @ oc - SPH_R ** 2)
sph_hit = disc > 0
t_sph = np.full(NRAY, np.inf, np.float32)
t_sph[sph_hit] = -b[sph_hit] - np.sqrt(disc[sph_hit])
t_sph[t_sph < 0] = np.inf

# ----------------------------- terrain march --------------------------------
print("ray marching terrain ...")
t = np.zeros(NRAY, np.float32)
t_hit = np.full(NRAY, np.inf, np.float32)
active = np.ones(NRAY, bool)
TMAX = 9.0
t += 0.05
prev_t = t.copy()
step = 0
while active.any() and step < 4000:
    step += 1
    ta = t[active]
    pos = ORIG[None, :] + ta[:, None] * D[active]
    hh = terrain_h(pos[:, 0], pos[:, 1])
    below = pos[:, 2] < hh
    idx = np.where(active)[0]
    hit_idx = idx[below]
    if hit_idx.size:
        # bisection refine between prev_t and t
        lo = prev_t[hit_idx]; hi = t[hit_idx]
        for _ in range(10):
            mid = 0.5 * (lo + hi)
            p = ORIG[None, :] + mid[:, None] * D[hit_idx]
            inside = p[:, 2] < terrain_h(p[:, 0], p[:, 1])
            hi = np.where(inside, mid, hi)
            lo = np.where(inside, lo, mid)
        t_hit[hit_idx] = 0.5 * (lo + hi)
        active[hit_idx] = False
    # advance
    prev_t[idx[~below]] = t[idx[~below]]
    adv = idx[~below]
    t[adv] += np.float32(0.0035) * (1 + t[adv])
    kill = active & (t > TMAX)
    active &= ~kill

terrain_seen = np.isfinite(t_hit)
use_sphere = t_sph < t_hit
hit_any = terrain_seen | np.isfinite(t_sph) & use_sphere

# ----------------------------- shading --------------------------------------
print("shading ...")
col = np.zeros((NRAY, 3), np.float32)

# sky gradient by ray elevation
elev = D[:, 2]
kx = np.clip((elev + 0.02) / 0.24, 0, 1)          # 0 at horizon, 1 high up
sky_stops = np.array([
    [1.00, 0.42, 0.05],   # horizon orange
    [0.55, 0.10, 0.02],   # deep red
    [0.10, 0.02, 0.02],   # maroon
    [0.01, 0.01, 0.015],  # black
])
sk = np.clip(kx, 0, 1) * (len(sky_stops) - 1)
i0 = np.clip(sk.astype(int), 0, len(sky_stops) - 2)
f = (sk - i0)[:, None]
sky = sky_stops[i0] * (1 - f) + sky_stops[i0 + 1] * f
col[:] = sky

FOG_COL = np.array([1.00, 0.42, 0.05], np.float32)

# ---- terrain pixels
ti = np.where(terrain_seen & ~use_sphere)[0]
if ti.size:
    tp = ORIG[None, :] + t_hit[ti, None] * D[ti]
    gx = bilinear(dx, tp[:, 0], tp[:, 1])
    gy = bilinear(dy, tp[:, 0], tp[:, 1])
    nrm = np.stack([-gx, -gy, np.ones_like(gx)], axis=1)
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True)
    diff = np.clip(nrm @ SUN.astype(np.float32), 0, 1)

    # cast shadows: march toward sun
    sh = np.ones(ti.size, np.float32)
    spos = tp + nrm * 0.004 + SUN[None, :] * 0.01
    st = np.full(ti.size, 0.012, np.float32)
    occl = np.zeros(ti.size, bool)
    for _ in range(220):
        p = spos + st[:, None] * SUN[None, :].astype(np.float32)
        over = p[:, 2] > HSCALE * 1.05
        hh = terrain_h(p[:, 0], p[:, 1])
        occl |= (p[:, 2] < hh) & ~over
        st += np.float32(0.01) * (1 + st)
        if over.all():
            break
    sh[occl] = 0.0

    inter = bilinear(interior, tp[:, 0], tp[:, 1]) > 0.5
    base = np.full((ti.size, 3), (0.93, 0.93, 0.96), np.float32)
    light = AMB_COL[None, :] + SUN_COL[None, :] * (diff * sh)[:, None]
    tcol = base * light
    tcol[inter] = (0.015, 0.012, 0.02)
    # distance fog toward horizon glow (fog color == sky-at-horizon so far
    # terrain melts into the sunset and near peaks silhouette against it)
    fog = 1 - np.exp(-0.008 * t_hit[ti] ** 3.0)
    tcol = tcol * (1 - fog[:, None]) + FOG_COL[None, :] * fog[:, None]
    col[ti] = np.clip(tcol, 0, 1.4)

# ---- sphere pixels
si = np.where(use_sphere)[0]
if si.size:
    sp = ORIG[None, :] + t_sph[si, None] * D[si]
    nrm = (sp - SPH_C[None, :]).astype(np.float32)
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True)
    diff = np.clip(nrm @ SUN.astype(np.float32), 0, 1)
    rim = np.clip(1 + (nrm * D[si]).sum(1), 0, 1) ** 2
    light = AMB_COL[None, :] * 1.1 + SUN_COL[None, :] * diff[:, None] * 0.9
    scol = SPH_COL[None, :] * light + rim[:, None] * np.float32(0.08)
    col[si] = np.clip(scol, 0, 1.2)

# ----------------------------- post ------------------------------------------
print("post ...")
img = np.clip(col.reshape(RES, RES, 3), 0, 1) ** (1 / 1.6)
img8 = (img * 255).astype(np.uint8)
im = Image.fromarray(img8).resize((OUT, OUT), Image.LANCZOS)
im = im.filter(ImageFilter.GaussianBlur(0.5))
# subtle CRT scanlines
arr = np.asarray(im).astype(np.float32)
arr[::3, :, :] *= 0.94
im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
im.save("render.png")
print("saved render.png")
