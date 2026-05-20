"use client";

import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/config";

// ─── Layout ──────────────────────────────────────────────────────────────────
const RADIUS = 3.8;
const CARD_W = 1.8;
const CARD_H = 2.25; // 4:5

// ─── Vertex shader — simple UV passthrough ───────────────────────────────────
const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// ─── Fragment shader — texture + fade towards edges ──────────────────────────
const FRAG = /* glsl */ `
precision mediump float;
uniform sampler2D map;
uniform float opacity;
varying vec2 vUv;
void main() {
  vec4 col = texture2D(map, vUv);
  // soft vignette on x edges so neighbours fade naturally
  float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
  gl_FragColor = vec4(col.rgb, col.a * opacity * edge);
}`;

// ─── Individual card (suspends on texture) ───────────────────────────────────
function Card({
  imageSrc,
  angle,
  cylinderAngle,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  imageSrc: string;
  angle: number; // rest angle on cylinder
  cylinderAngle: number; // reactive cylinder rotation
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const tex = useLoader(TextureLoader, imageSrc);
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          map: { value: tex },
          opacity: { value: 1.0 },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [tex],
  );

  useEffect(() => {
    material.uniforms.map.value = tex;
  }, [tex, material]);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame(() => {
    if (!meshRef.current) return;
    const a = angle + cylinderAngle;
    const x = Math.sin(a) * RADIUS;
    const z = Math.cos(a) * RADIUS - RADIUS;

    meshRef.current.position.x = x;
    meshRef.current.position.z = z;
    // Face inward (toward camera at z=0)
    meshRef.current.rotation.y = a;

    // Scale up the card closest to camera
    const normZ = (z + RADIUS) / RADIUS; // 0 = farthest, 1 = closest
    const s = 0.78 + normZ * 0.22;
    meshRef.current.scale.setScalar(s);

    // Fade out cards facing away
    const facingAngle = Math.cos(a);
    material.uniforms.opacity.value = THREE.MathUtils.clamp(
      0.3 + 0.7 * ((facingAngle + 1) / 2),
      0.25,
      1.0,
    );
  });

  return (
    <mesh
      ref={meshRef}
      material={material}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <planeGeometry args={[CARD_W, CARD_H]} />
    </mesh>
  );
}

// ─── Inner scene ─────────────────────────────────────────────────────────────
function Scene({
  products,
  locale,
  onNavigate,
}: {
  products: Product[];
  locale: Locale;
  onNavigate: (slug: string) => void;
}) {
  const { gl } = useThree();
  const count = products.length;

  // cylinderAngle drives the whole carousel
  const cylinderAngle = useRef(0);
  const targetAngle = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const autoSpin = useRef(true);

  useEffect(() => {
    const canvas = gl.domElement;

    function onDown(e: PointerEvent) {
      isDragging.current = true;
      lastX.current = e.clientX;
      autoSpin.current = false;
    }
    function onMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      targetAngle.current -= dx * 0.005;
    }
    function onUp() {
      isDragging.current = false;
      // Resume auto-spin after 2.5s of inactivity
      setTimeout(() => {
        autoSpin.current = true;
      }, 2500);
    }

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  useFrame((_, dt) => {
    if (autoSpin.current) {
      targetAngle.current += dt * 0.18;
    }
    cylinderAngle.current = THREE.MathUtils.lerp(
      cylinderAngle.current,
      targetAngle.current,
      Math.min(1, dt * 5),
    );
  });

  return (
    <>
      <ambientLight intensity={2.5} />
      {products.map((p, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <CylinderCard
            key={p.slug}
            imageSrc={p.images[0].src}
            angle={angle}
            cylinderAngleRef={cylinderAngle}
            onClick={() => onNavigate(p.slug)}
          />
        );
      })}
    </>
  );
}

// ─── Wrapper that reads ref every frame (avoids passing reactive state) ───────
function CylinderCard({
  imageSrc,
  angle,
  cylinderAngleRef,
  onClick,
}: {
  imageSrc: string;
  angle: number;
  cylinderAngleRef: React.MutableRefObject<number>;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  // We need a per-frame angle value; read the ref in a wrapper useFrame
  const liveAngle = useRef(0);
  useFrame(() => {
    liveAngle.current = cylinderAngleRef.current;
  });

  // Use a locally computed angle passed via prop read in useFrame
  return (
    <Card
      imageSrc={imageSrc}
      angle={angle}
      cylinderAngle={liveAngle.current}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}

// ─── Public component ────────────────────────────────────────────────────────
export function ProductSlider3D({
  products,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  const router = useRouter();

  function onNavigate(slug: string) {
    router.push(`/${locale}/shop/${slug}`);
  }

  return (
    <div className="relative h-[480px] w-full md:h-[560px]">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 52 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene products={products} locale={locale} onNavigate={onNavigate} />
        </Suspense>
      </Canvas>

      {/* Drag hint */}
      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted/60 select-none">
        {locale === "de" ? "Ziehen zum Drehen" : "Drag to spin"}
      </p>
    </div>
  );
}
