"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-driven cinematic assembly: the real statue image is sampled into
// thousands of coloured particles that start scattered (floating fragments in
// red fog) and converge into the exact image as you scroll. Statue stays
// identical, camera stays fixed (it IS the source image) — the effect the
// brief asks for, done the way it actually works on the web.

interface Particle {
  sx: number; // sample-space x
  sy: number; // sample-space y
  r: number;
  g: number;
  b: number;
  oxf: number; // scattered origin as a fraction of width
  oyf: number; // scattered origin as a fraction of height
  delay: number; // 0..0.6 — staggers the convergence
}

const SAMPLE_W = 300;
const SAMPLE_H = Math.round(SAMPLE_W * (1450 / 1085)); // keep image aspect
const LUMA_THRESHOLD = 30; // skip the near-black background

export default function CinematicStatue() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const MAX_PARTICLES = isMobile ? 4500 : 13000;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles: Particle[] = [];
    let W = 0;
    let H = 0;
    let scale = 1;
    let offX = 0;
    let offY = 0;
    let pSize = 2;
    let progress = 0;
    let raf = 0;
    let visible = true;

    function layout() {
      W = wrap!.clientWidth;
      H = window.innerHeight;
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      let dispH = H * 0.82;
      let dispW = (dispH * SAMPLE_W) / SAMPLE_H;
      if (dispW > W * 0.92) {
        dispW = W * 0.92;
        dispH = (dispW * SAMPLE_H) / SAMPLE_W;
      }
      scale = dispW / SAMPLE_W;
      offX = (W - dispW) / 2;
      offY = (H - dispH) / 2 + H * 0.02;
      pSize = Math.max(1.4, scale * 1.7);
    }

    function onScroll() {
      const scrollable = wrap!.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-wrap!.getBoundingClientRect().top, 0), scrollable);
      progress = scrollable > 0 ? passed / scrollable : 0;
    }

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

    function loop() {
      ctx!.clearRect(0, 0, W, H);
      const p = easeOutCubic(clamp01(progress));
      const t = Date.now() / 900;
      for (let i = 0; i < particles.length; i++) {
        const part = particles[i];
        const denom = 1 - part.delay || 1;
        const local = clamp01((p - part.delay) / denom);
        const e = easeOutCubic(local);
        const tx = offX + part.sx * scale;
        const ty = offY + part.sy * scale;
        const ox = part.oxf * W;
        const oy = part.oyf * H;
        // gentle floating wobble while still scattered, vanishes on assembly
        const wob = (1 - e) * 10;
        const x = ox + (tx - ox) * e + Math.sin(t + part.sx) * wob;
        const y = oy + (ty - oy) * e + Math.cos(t + part.sy) * wob;
        ctx!.globalAlpha = 0.12 + 0.88 * e;
        ctx!.fillStyle = `rgb(${part.r},${part.g},${part.b})`;
        ctx!.fillRect(x, y, pSize, pSize);
      }
      ctx!.globalAlpha = 1;
      if (visible) raf = requestAnimationFrame(loop);
    }

    const img = new Image();
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = SAMPLE_W;
      off.height = SAMPLE_H;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
      const data = octx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;

      // pass 1: collect bright (non-background) pixels
      const bright: number[] = [];
      for (let i = 0; i < SAMPLE_W * SAMPLE_H; i++) {
        const o = i * 4;
        const r = data[o];
        const g = data[o + 1];
        const b = data[o + 2];
        if (0.299 * r + 0.587 * g + 0.114 * b > LUMA_THRESHOLD) bright.push(i);
      }
      // pass 2: subsample down to the particle budget
      const keep = Math.min(1, MAX_PARTICLES / Math.max(1, bright.length));
      const next: Particle[] = [];
      for (const i of bright) {
        if (Math.random() > keep) continue;
        const o = i * 4;
        const edge = Math.floor(Math.random() * 4);
        // scatter origins out past the screen edges for a "flying in" feel
        const oxf = edge === 0 ? -0.25 + Math.random() * 0.1 : edge === 1 ? 1.15 + Math.random() * 0.1 : Math.random() * 1.4 - 0.2;
        const oyf = edge === 2 ? -0.25 + Math.random() * 0.1 : edge === 3 ? 1.15 + Math.random() * 0.1 : Math.random() * 1.4 - 0.2;
        next.push({
          sx: i % SAMPLE_W,
          sy: Math.floor(i / SAMPLE_W),
          r: Math.min(255, data[o] + 12),
          g: data[o + 1],
          b: data[o + 2],
          oxf,
          oyf,
          delay: Math.random() * 0.55,
        });
      }
      particles = next;
      layout();
      onScroll();
      setReady(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    img.src = "/cinematic/justice.png";

    const onResize = () => {
      layout();
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative" style={{ height: "420vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0000]">
        {/* Cinematic atmosphere */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 32%, #4A0000 0%, #2A0000 38%, #170000 66%, #0A0000 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{ background: "radial-gradient(40% 70% at 50% 0%, rgba(216,90,90,0.30), transparent 70%)" }}
        />
        <canvas ref={canvasRef} className="absolute inset-0" />
        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 45%, transparent 45%, rgba(10,0,0,0.55) 100%)" }}
        />
        {/* Scroll hint */}
        {ready && (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-[#D85A5A]">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase opacity-80">Scrollen</span>
            <span className="h-8 w-px animate-pulse bg-gradient-to-b from-[#D85A5A] to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
