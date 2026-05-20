"use client";

import { useEffect, useRef } from "react";

const MAX_ORBS = 6;

const VS = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

// Liquid mercury — exactly as wallpaper #3.
// Renders to a full-opaque canvas (no alpha math); we're a real backdrop now.
const FS = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 u_res;
uniform float u_t;
uniform vec2 u_m;
uniform vec2 u_orbs[${MAX_ORBS}];
uniform float u_radii[${MAX_ORBS}];
uniform int u_orbCount;

vec2 toUV(vec2 p){ return (p - 0.5 * u_res) / min(u_res.x, u_res.y); }

void main(){
  vec2 uv = toUV(gl_FragCoord.xy);
  vec2 mu = toUV(u_m);

  float field = (0.20 * 0.20) / max(dot(uv - mu, uv - mu), 1e-6);

  for (int i = 0; i < ${MAX_ORBS}; i++){
    if (i >= u_orbCount) break;
    vec2 op = toUV(u_orbs[i]);
    float r = u_radii[i];
    field += (r * r) / max(dot(uv - op, uv - op), 1e-6);
  }

  float iso = smoothstep(0.6, 1.4, field);
  float edge = smoothstep(0.45, 0.6, field) - smoothstep(1.4, 1.6, field);

  vec3 deep   = vec3(0.04, 0.02, 0.10);
  vec3 violet = vec3(0.30, 0.18, 0.85);
  vec3 silver = vec3(0.85, 0.92, 1.00);
  vec3 hot    = vec3(1.00, 0.55, 0.85);

  vec3 col = deep;
  col = mix(col, violet, smoothstep(0.30, 0.95, field));
  col = mix(col, silver, smoothstep(0.95, 1.6, field));
  col = mix(col, hot,    smoothstep(2.0, 4.0, field) * 0.55);

  col += edge * vec3(0.55, 0.70, 1.0) * 1.4;

  float haze = 0.04 + 0.06 * sin(u_t * 0.4 + uv.x * 2.0);
  col += vec3(0.05, 0.04, 0.12) * (1.0 - iso) * haze * 4.0;

  col *= mix(0.55, 1.0, smoothstep(1.4, 0.3, length(uv)));

  o = vec4(col, 1.0);
}`;

export function MetaballsHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        // eslint-disable-next-line no-console
        console.error(gl!.getShaderInfoLog(s));
      }
      return s;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const u_res = u("u_res");
    const u_t = u("u_t");
    const u_m = u("u_m");
    const u_orbs = u("u_orbs");
    const u_radii = u("u_radii");
    const u_orbCount = u("u_orbCount");

    const dprFn = () => Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !wrap) return;
      const r = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, r.width * dprFn());
      canvas.height = Math.max(1, r.height * dprFn());
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    window.addEventListener("resize", resize);

    // mouse position relative to the hero element
    const mouse = [0, 0];
    const mSm = mouse.slice();
    function onMove(e: PointerEvent) {
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      // remap to canvas pixel space, with Y flipped because GL is bottom-up
      const x = (e.clientX - r.left) * dprFn();
      const y = (r.height - (e.clientY - r.top)) * dprFn();
      mouse[0] = x;
      mouse[1] = y;
    }
    function onLeave() {
      if (!canvas) return;
      mouse[0] = canvas.width * 0.5;
      mouse[1] = canvas.height * 0.6;
    }
    onLeave();
    mSm[0] = mouse[0];
    mSm[1] = mouse[1];
    window.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    // 4 autonomous secondary orbs
    type Orb = { ax: number; ay: number; rx: number; ry: number; phase: number; speed: number; r: number };
    const ORB_COUNT = 4;
    const orbs: Orb[] = Array.from({ length: ORB_COUNT }).map((_, i) => ({
      ax: 0.5 + Math.sin(i * 1.7) * 0.30,
      ay: 0.5 + Math.cos(i * 2.3) * 0.25,
      rx: 0.32 + i * 0.06,
      ry: 0.22 + i * 0.05,
      phase: i * Math.PI * 0.6,
      speed: 0.10 + i * 0.018,
      r: 0.14 + (i % 2) * 0.06,
    }));

    let raf = 0;
    const startedAt = performance.now();
    const fp = new Float32Array(MAX_ORBS * 2);
    const fr = new Float32Array(MAX_ORBS);

    function frame() {
      if (!canvas) return;
      const t = (performance.now() - startedAt) * 0.001;

      mSm[0] += (mouse[0] - mSm[0]) * 0.10;
      mSm[1] += (mouse[1] - mSm[1]) * 0.10;

      for (let i = 0; i < ORB_COUNT; i++) {
        const orb = orbs[i];
        const cx = orb.ax + Math.cos(t * orb.speed + orb.phase) * orb.rx;
        const cy = orb.ay + Math.sin(t * orb.speed * 0.85 + orb.phase * 1.3) * orb.ry;
        fp[i * 2] = cx * canvas.width;
        fp[i * 2 + 1] = cy * canvas.height;
        fr[i] = orb.r;
      }

      gl!.uniform2f(u_res, canvas.width, canvas.height);
      gl!.uniform1f(u_t, t);
      gl!.uniform2f(u_m, mSm[0], mSm[1]);
      gl!.uniform1i(u_orbCount, ORB_COUNT);
      gl!.uniform2fv(u_orbs, fp);
      gl!.uniform1fv(u_radii, fr);

      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
