"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const MAX_ORBS = 6;

const VS = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

// Original metaballs palette (wallpaper #3 — liquid mercury):
// deep violet → silver chrome → hot pink highlights.
// We blend over the page bg via alpha; intensity controls how strong.
const FS = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 u_res;
uniform float u_t;
uniform vec2 u_m;
uniform vec2 u_orbs[${MAX_ORBS}];
uniform float u_radii[${MAX_ORBS}];
uniform int u_orbCount;
uniform float u_dark;       // 0 = light, 1 = dark
uniform float u_intensity;  // master alpha multiplier

vec2 toUV(vec2 p){ return (p - 0.5 * u_res) / min(u_res.x, u_res.y); }

void main(){
  vec2 uv = toUV(gl_FragCoord.xy);
  vec2 mu = toUV(u_m);

  // mouse acts as the bright primary orb
  float field = (0.18 * 0.18) / max(dot(uv - mu, uv - mu), 1e-6);

  // autonomous secondary orbs
  for (int i = 0; i < ${MAX_ORBS}; i++){
    if (i >= u_orbCount) break;
    vec2 op = toUV(u_orbs[i]);
    float r = u_radii[i];
    field += (r * r) / max(dot(uv - op, uv - op), 1e-6);
  }

  float iso  = smoothstep(0.6, 1.4, field);
  float edge = smoothstep(0.45, 0.6, field) - smoothstep(1.4, 1.6, field);

  // ── Liquid-mercury palette (light-mode tilt: cooler shadows, warmer highlights) ──
  vec3 deep    = vec3(0.04, 0.02, 0.10);   // deep indigo void
  vec3 violet  = vec3(0.28, 0.16, 0.78);   // violet body
  vec3 silver  = vec3(0.85, 0.92, 1.00);   // chrome highlight
  vec3 hot     = vec3(1.00, 0.40, 0.80);   // hot-pink core

  vec3 col = deep;
  col = mix(col, violet, smoothstep(0.30, 0.95, field));
  col = mix(col, silver, smoothstep(0.95, 1.6, field));
  col = mix(col, hot,    smoothstep(2.0, 4.0, field) * 0.55);

  // edge highlight stays in icy blue tones
  col += edge * vec3(0.55, 0.70, 1.0) * 1.4;

  // Slight ambient haze
  float haze = 0.04 + 0.06 * sin(u_t * 0.4 + uv.x * 2.0);
  col += vec3(0.05, 0.04, 0.12) * (1.0 - iso) * haze * 4.0;

  // Vignette
  col *= mix(0.55, 1.0, smoothstep(1.4, 0.3, length(uv)));

  // alpha — only the lit-up parts blend strongly; the dark areas stay transparent
  // so warm page bg shines through.
  float alpha = clamp(field * 0.40 + iso * 0.55, 0.0, 1.0) * u_intensity;

  // tiny lift so very dark areas don't punch a hole when alpha is small
  alpha = max(alpha, 0.05 * u_intensity);

  o = vec4(col, alpha);
}`;

export function AmbientMetaballs({ intensity = 0.55 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: false });
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
    const u_dark = u("u_dark");
    const u_intensity = u("u_intensity");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const dprFn = () => Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * dprFn();
      canvas.height = window.innerHeight * dprFn();
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    // Mouse position is captured at the document level — even though the canvas
    // itself has pointer-events:none, this lets the metaballs follow the cursor
    // while the user is reading/clicking content above.
    const mouse = [window.innerWidth / 2, window.innerHeight / 2];
    const mSm = mouse.slice();
    function onMove(e: PointerEvent) {
      mouse[0] = e.clientX * dprFn();
      mouse[1] = (window.innerHeight - e.clientY) * dprFn();
    }
    window.addEventListener("pointermove", onMove);

    // Autonomous orbs — slow elliptical drift.
    type Orb = { ax: number; ay: number; rx: number; ry: number; phase: number; speed: number; r: number };
    const ORB_COUNT = 4;
    const orbs: Orb[] = Array.from({ length: ORB_COUNT }).map((_, i) => ({
      ax: 0.5 + Math.sin(i * 1.7) * 0.25,
      ay: 0.5 + Math.cos(i * 2.3) * 0.20,
      rx: 0.30 + (i * 0.06),
      ry: 0.22 + (i * 0.05),
      phase: i * Math.PI * 0.6,
      speed: 0.07 + i * 0.012,
      r: 0.16 + (i % 2) * 0.05,
    }));

    let raf = 0;
    const startedAt = performance.now();
    const fp = new Float32Array(MAX_ORBS * 2);
    const fr = new Float32Array(MAX_ORBS);

    function frame() {
      if (!canvas) return;
      const t = (performance.now() - startedAt) * 0.001;

      // smooth mouse
      mSm[0] += (mouse[0] - mSm[0]) * 0.10;
      mSm[1] += (mouse[1] - mSm[1]) * 0.10;

      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      // compute autonomous orb positions
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
      gl!.uniform1f(u_dark, resolvedTheme === "dark" ? 1.0 : 0.0);
      gl!.uniform1f(u_intensity, intensity);

      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [resolvedTheme, intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
