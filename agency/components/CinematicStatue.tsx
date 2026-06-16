"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-driven cinematic assembly: the real statue image is sampled into
// thousands of glowing particles that converge into the exact image as you
// scroll. Additive blending + a growing light halo + drifting embers + film
// grain give it an AAA-trailer feel. Statue identical, camera fixed.

interface Particle {
  sx: number;
  sy: number;
  r: number;
  g: number;
  b: number;
  oxf: number;
  oyf: number;
  delay: number;
  sizeMul: number;
}
interface Ember {
  x: number;
  y: number;
  s: number;
  spd: number;
  a: number;
}

const SAMPLE_W = 300;
const SAMPLE_H = Math.round(SAMPLE_W * (1450 / 1085));
const LUMA_THRESHOLD = 16;

export default function CinematicStatue({ scrollVh = 600 }: { scrollVh?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const MAX_PARTICLES = isMobile ? 5000 : 14000;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles: Particle[] = [];
    let embers: Ember[] = [];
    let W = 0;
    let H = 0;
    let scale = 1;
    let offX = 0;
    let offY = 0;
    let pSize = 2;
    let targetP = 0;
    let displayP = 0;
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
      pSize = Math.max(1.4, scale * 1.55);
      embers = Array.from({ length: isMobile ? 26 : 60 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 0.6 + Math.random() * 1.8,
        spd: 0.15 + Math.random() * 0.5,
        a: 0.1 + Math.random() * 0.35,
      }));
    }

    function onScroll() {
      const scrollable = wrap!.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-wrap!.getBoundingClientRect().top, 0), scrollable);
      targetP = scrollable > 0 ? passed / scrollable : 0;
    }

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

    function loop() {
      // buttery smoothing toward the scroll target (lower = slower, more languid)
      displayP += (targetP - displayP) * 0.05;
      const p = easeOutCubic(clamp01(displayP));
      const time = Date.now() / 900;

      ctx!.clearRect(0, 0, W, H);
      ctx!.globalCompositeOperation = "lighter";

      // growing light halo behind the figure
      const cx = offX + (SAMPLE_W * scale) / 2;
      const cy = offY + SAMPLE_H * scale * 0.4;
      const haloR = Math.max(W, H) * 0.55;
      const halo = ctx!.createRadialGradient(cx, cy, 0, cx, cy, haloR);
      halo.addColorStop(0, `rgba(255,150,150,${0.22 * p + 0.03})`);
      halo.addColorStop(0.28, `rgba(216,90,90,${0.3 * p + 0.03})`);
      halo.addColorStop(0.6, `rgba(122,17,17,${0.16 * p})`);
      halo.addColorStop(1, "rgba(122,17,17,0)");
      ctx!.fillStyle = halo;
      ctx!.fillRect(0, 0, W, H);

      // drifting embers (always alive)
      for (const e of embers) {
        e.y -= e.spd;
        e.x += Math.sin((time + e.y) * 0.5) * 0.2;
        if (e.y < -4) {
          e.y = H + 4;
          e.x = Math.random() * W;
        }
        ctx!.globalAlpha = e.a * (0.5 + 0.5 * p);
        ctx!.fillStyle = "rgb(216,120,120)";
        ctx!.fillRect(e.x, e.y, e.s, e.s);
      }

      // converging statue particles
      for (let i = 0; i < particles.length; i++) {
        const part = particles[i];
        const denom = 1 - part.delay || 1;
        const e = easeOutCubic(clamp01((p - part.delay) / denom));
        const tx = offX + part.sx * scale;
        const ty = offY + part.sy * scale;
        const ox = part.oxf * W;
        const oy = part.oyf * H;
        const wob = (1 - e) * 12;
        const x = ox + (tx - ox) * e + Math.sin(time + part.sx) * wob;
        const y = oy + (ty - oy) * e + Math.cos(time + part.sy) * wob;
        ctx!.globalAlpha = 0.12 + 0.85 * e;
        ctx!.fillStyle = `rgb(${part.r},${part.g},${part.b})`;
        const s = pSize * part.sizeMul;
        ctx!.fillRect(x, y, s, s);
      }

      // The crisp statue assembles BOTTOM-UP as you scroll: only the bottom
      // `revealH` of the real image is drawn (base first → head last), so it
      // genuinely rebuilds from broken fragments into the whole figure.
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = "source-over";
      const dW = SAMPLE_W * scale;
      const dH = SAMPLE_H * scale;
      const revealH = dH * easeOutCubic(clamp01(displayP * 1.04));
      if (revealH > 1) {
        const topY = offY + dH - revealH;
        ctx!.save();
        ctx!.beginPath();
        ctx!.rect(offX - 6, topY, dW + 12, revealH + 6);
        ctx!.clip();
        ctx!.filter = "brightness(1.3) saturate(1.12) contrast(1.04)";
        ctx!.drawImage(img, offX, offY, dW, dH);
        ctx!.filter = "none";
        ctx!.restore();
        // glowing "construction line" sweeping upward at the assembly frontier
        if (displayP > 0.02 && displayP < 0.985) {
          ctx!.globalCompositeOperation = "lighter";
          const g = ctx!.createLinearGradient(0, topY - 22, 0, topY + 12);
          g.addColorStop(0, "rgba(216,90,90,0)");
          g.addColorStop(0.72, "rgba(255,150,150,0.55)");
          g.addColorStop(1, "rgba(216,90,90,0)");
          ctx!.fillStyle = g;
          ctx!.fillRect(offX, topY - 22, dW, 34);
          ctx!.globalCompositeOperation = "source-over";
        }
      }
      ctx!.globalAlpha = 1;

      if (titleRef.current) {
        titleRef.current.style.opacity = String(clamp01((displayP - 0.72) / 0.24));
      }
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

      const bright: number[] = [];
      for (let i = 0; i < SAMPLE_W * SAMPLE_H; i++) {
        const o = i * 4;
        if (0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2] > LUMA_THRESHOLD)
          bright.push(i);
      }
      const keep = Math.min(1, MAX_PARTICLES / Math.max(1, bright.length));
      const next: Particle[] = [];
      for (const i of bright) {
        if (Math.random() > keep) continue;
        const o = i * 4;
        const syVal = Math.floor(i / SAMPLE_W);
        const edge = Math.floor(Math.random() * 4);
        const oxf = edge === 0 ? -0.25 + Math.random() * 0.1 : edge === 1 ? 1.15 + Math.random() * 0.1 : Math.random() * 1.4 - 0.2;
        const oyf = edge === 2 ? -0.25 + Math.random() * 0.1 : edge === 3 ? 1.15 + Math.random() * 0.1 : Math.random() * 1.4 - 0.2;
        // Bottom-up assembly: base/feet (large sy) form first, head (small sy)
        // last — exactly the brief's order (Sockel → Beine → Körper → Kopf).
        const heightFrac = 1 - syVal / SAMPLE_H; // 0 at bottom, 1 at top
        const delay = Math.min(0.85, Math.max(0, heightFrac * 0.78 + (Math.random() - 0.5) * 0.12));
        next.push({
          sx: i % SAMPLE_W,
          sy: syVal,
          r: Math.min(255, Math.round(data[o] * 1.55 + 42)),
          g: Math.min(255, Math.round(data[o + 1] * 1.35 + 14)),
          b: Math.min(255, Math.round(data[o + 2] * 1.35 + 14)),
          oxf,
          oyf,
          delay,
          sizeMul: 0.7 + Math.random() * 0.9,
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
    <div ref={wrapRef} className="relative" style={{ height: `${scrollVh}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0000]">
        {/* base crimson glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(72% 56% at 50% 30%, #2A0000 0%, #1A0000 42%, #120000 70%, #070000 100%)",
          }}
        />
        {/* god-ray light shafts from the top */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[70%] opacity-70"
          style={{
            background:
              "conic-gradient(from 180deg at 50% -10%, transparent 0deg, rgba(216,90,90,0.18) 12deg, transparent 24deg, rgba(216,90,90,0.12) 40deg, transparent 60deg, rgba(216,90,90,0.16) 78deg, transparent 96deg)",
            filter: "blur(6px)",
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
        <canvas ref={canvasRef} className="absolute inset-0" />
        {/* film grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 45%, transparent 42%, rgba(7,0,0,0.62) 100%)" }}
        />
        {/* title reveal at the end */}
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-x-0 bottom-[14%] flex flex-col items-center px-6 text-center"
          style={{ opacity: 0, transition: "opacity 0.2s linear" }}
        >
          <span className="text-[0.7rem] font-semibold tracking-[0.45em] text-[#D85A5A] uppercase">
            NOREVAN Digital
          </span>
          <h2
            className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "#F4DCDC", textShadow: "0 2px 30px rgba(216,90,90,0.5)" }}
          >
            Aus Fragmenten. Zu Stärke.
          </h2>
        </div>
        {/* scroll hint */}
        {ready && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 text-[#D85A5A]">
            <span className="text-[0.65rem] font-semibold tracking-[0.3em] uppercase opacity-70">
              Scrollen
            </span>
            <span className="h-7 w-px animate-pulse bg-gradient-to-b from-[#D85A5A] to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
