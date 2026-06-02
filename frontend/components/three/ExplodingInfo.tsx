"use client";

/* eslint-disable react-hooks/purity, react-hooks/immutability --
   react-three-fiber animation code: reading time/Math in useFrame and mutating
   Three.js objects inside the render loop is the intended r3f pattern. */

import { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { AnimatePresence, motion, useMotionValue, animate } from "motion/react";
import * as THREE from "three";
import { TextureLoader } from "three";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/config";

// ─── Grid config ────────────────────────────────────────────────────────────
const COLS = 8;
const ROWS = 8;
const COUNT = COLS * ROWS; // 64 tiles

// ─── Per-instance UV shader ──────────────────────────────────────────────────
const VERT = /* glsl */ `
attribute vec2 uvOffset;
attribute vec2 uvScale;
varying   vec2 vUv;
void main() {
  vUv = uvOffset + uv * uvScale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = /* glsl */ `
precision mediump float;
uniform sampler2D map;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(map, vUv);
}`;

// ─── Per-tile blown geometry ─────────────────────────────────────────────────
type BlownTile = {
  pos: THREE.Vector3;
  rot: THREE.Euler;
};

// ─── Inner R3F component (suspends on texture) ───────────────────────────────
function Tiles({
  imageSrc,
  progress,
}: {
  imageSrc: string;
  progress: ReturnType<typeof useMotionValue<number>>;
}) {
  const tex = useLoader(TextureLoader, imageSrc);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Tile world-space size for a 4:5 image shown in a 2.4×3.0 viewport frame
  const TW = 2.4 / COLS;
  const TH = 3.0 / ROWS;

  // Rest positions — tiles assembled into the full image
  const restPos = useMemo<THREE.Vector3[]>(() => {
    const arr: THREE.Vector3[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        arr.push(
          new THREE.Vector3(
            (c - (COLS - 1) / 2) * TW,
            ((ROWS - 1) / 2 - r) * TH,
            0,
          ),
        );
      }
    }
    return arr;
  }, [TW, TH]);

  // Blown positions — each tile flies to a random point on a sphere
  const blown = useMemo<BlownTile[]>(() => {
    return Array.from({ length: COUNT }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 2;
      return {
        pos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi) - 1,
        ),
        rot: new THREE.Euler(
          (Math.random() - 0.5) * Math.PI * 1.4,
          (Math.random() - 0.5) * Math.PI * 1.4,
          (Math.random() - 0.5) * Math.PI * 2,
        ),
      };
    });
  }, []);

  // Geometry with per-instance UV attributes
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(TW * 0.97, TH * 0.97);

    const uvOff = new Float32Array(COUNT * 2);
    const uvScl = new Float32Array(COUNT * 2);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        uvOff[i * 2] = c / COLS;
        uvOff[i * 2 + 1] = 1 - (r + 1) / ROWS;
        uvScl[i * 2] = 1 / COLS;
        uvScl[i * 2 + 1] = 1 / ROWS;
      }
    }
    geo.setAttribute("uvOffset", new THREE.InstancedBufferAttribute(uvOff, 2));
    geo.setAttribute("uvScale", new THREE.InstancedBufferAttribute(uvScl, 2));
    return geo;
  }, [TW, TH]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { map: { value: tex } },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    [tex],
  );

  useEffect(() => {
    material.uniforms.map.value = tex;
  }, [tex, material]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const raw = progress.get();
    // Ease-in-out quad so that even a linear MotionValue animates naturally
    const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

    for (let i = 0; i < COUNT; i++) {
      const rp = restPos[i];
      const bp = blown[i];
      dummy.position.lerpVectors(rp, bp.pos, t);
      dummy.rotation.set(
        bp.rot.x * t,
        bp.rot.y * t,
        bp.rot.z * t,
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={2.5} />
      <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} />
    </>
  );
}

// ─── Public component ────────────────────────────────────────────────────────
export function ExplodingInfo({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const [exploded, setExploded] = useState(false);
  const progress = useMotionValue(0);

  function toggle() {
    const target = exploded ? 0 : 1;
    animate(progress, target, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] });
    setExploded((v) => !v);
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-background-soft">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Tiles imageSrc={product.images[0].src} progress={progress} />
        </Suspense>
      </Canvas>

      {/* Specs overlay — fades in once tiles have flown apart */}
      <AnimatePresence>
        {exploded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
            className="absolute inset-0 flex items-center justify-center bg-background/85 p-8 backdrop-blur-sm"
          >
            <motion.dl
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.06, delayChildren: 0.05 },
                },
              }}
              className="w-full max-w-xs divide-y divide-border-subtle"
            >
              {product.specs.slice(0, 6).map((spec) => (
                <motion.div
                  key={spec.label.de}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] },
                    },
                  }}
                  className="flex justify-between gap-4 py-3"
                >
                  <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                    {spec.label[locale]}
                  </dt>
                  <dd className="text-xs font-medium text-foreground">
                    {spec.value[locale]}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-4 right-4 z-10 rounded-full border border-border bg-background/80 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm transition-colors hover:border-foreground hover:bg-background"
        aria-label={
          exploded
            ? locale === "de"
              ? "Bild anzeigen"
              : "Show image"
            : locale === "de"
              ? "Details anzeigen"
              : "Show details"
        }
      >
        {exploded
          ? locale === "de"
            ? "← Bild"
            : "← Image"
          : locale === "de"
            ? "Details →"
            : "Details →"}
      </motion.button>
    </div>
  );
}
