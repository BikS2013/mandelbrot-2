import { FOV_TAN, SPH_R } from './constants';
import { isTouchDevice } from './device';
import { FS, VS } from './shaders';
import type { CamBasis, Vec3 } from './types';

// mobile GPUs pay dearly for the per-pixel march — cap the internal resolution
const DPR_CAP = isTouchDevice ? 1 : 1.5;

export interface DrawInput {
  basis: CamBasis;
  sunDir: Vec3;
  sunI: number;
  beta: number;
  sphereOn: boolean;
  sphereX: number;
  sphereY: number;
  sphereZ: number;
  shadows: boolean;
  crt: boolean;
}

const UNIFORMS = [
  'uField', 'uRes', 'uCamPos', 'uFwd', 'uRight', 'uUp', 'uTanHalf',
  'uSunDir', 'uSunI', 'uBeta', 'uSphere', 'uSphereOn', 'uShadows', 'uCrt',
] as const;
type UniformName = (typeof UNIFORMS)[number];

export class Renderer {
  private gl: WebGL2RenderingContext;
  private u: Record<UniformName, WebGLUniformLocation | null>;
  private fieldTex: WebGLTexture | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) throw new Error('WebGL2 is required');
    this.gl = gl;

    const prog = gl.createProgram();
    gl.attachShader(prog, this.compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, this.compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) ?? 'shader link failed');
    }
    gl.useProgram(prog);
    this.u = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl.getUniformLocation(prog, name)]),
    ) as Record<UniformName, WebGLUniformLocation | null>;
  }

  private compile(type: number, src: string): WebGLShader {
    const gl = this.gl;
    const s = gl.createShader(type);
    if (!s) throw new Error('createShader failed');
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile failed');
    }
    return s;
  }

  uploadField(data: Float32Array, n: number): void {
    const gl = this.gl;
    if (!this.fieldTex) this.fieldTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fieldTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, n, n, 0, gl.RG, gl.FLOAT, data);
  }

  draw(input: DrawInput): void {
    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const w = Math.round(this.canvas.clientWidth * dpr);
    const h = Math.round(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    gl.viewport(0, 0, w, h);

    const { basis } = input;
    gl.uniform1i(this.u.uField, 0);
    gl.uniform2f(this.u.uRes, w, h);
    gl.uniform3fv(this.u.uCamPos, basis.pos);
    gl.uniform3fv(this.u.uFwd, basis.fwd);
    gl.uniform3fv(this.u.uRight, basis.right);
    gl.uniform3fv(this.u.uUp, basis.up);
    gl.uniform1f(this.u.uTanHalf, FOV_TAN);
    gl.uniform3fv(this.u.uSunDir, input.sunDir);
    gl.uniform1f(this.u.uSunI, input.sunI);
    gl.uniform1f(this.u.uBeta, input.beta);
    gl.uniform4f(this.u.uSphere, input.sphereX, input.sphereY, input.sphereZ, SPH_R);
    gl.uniform1i(this.u.uSphereOn, input.sphereOn ? 1 : 0);
    gl.uniform1i(this.u.uShadows, input.shadows ? 1 : 0);
    gl.uniform1i(this.u.uCrt, input.crt ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
