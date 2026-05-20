"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

const VS = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Always loads the light-asset PNG (black logo on near-white bg, with PNG alpha).
// In LIGHT mode (invert=0): drop near-white pixels, keep dark logo colors.
// In DARK mode (invert=1): drop near-white pixels, then invert RGB of remaining
// (black logo → white logo). For brands with intrinsic color (Ami's red heart),
// invert is forced 0 so the red is preserved.
const FS = `
precision highp float;
uniform sampler2D map;
uniform float invert;
varying vec2 vUv;

void main() {
  vec4 c = texture2D(map, vUv);
  float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  // Drop bright background everywhere (>0.92 fully transparent, <0.82 fully opaque).
  float keep = smoothstep(0.92, 0.82, lum);
  vec3 rgb = mix(c.rgb, vec3(1.0) - c.rgb, invert);
  gl_FragColor = vec4(rgb, c.a * keep);
}`;

type BrandSpec = {
  id: "nike" | "polo-ralph-lauren" | "ami-paris";
  xMul: number;
  y: number;
  z: number;
  scale: [number, number];
  speed: number;
  /** Brand has its own colors that should NOT be inverted in dark mode. */
  preserveColor: boolean;
};

const BRANDS: BrandSpec[] = [
  { id: "nike", xMul: -1, y: 0.15, z: 0, scale: [1.9, 0.8], speed: 0.18, preserveColor: false },
  { id: "polo-ralph-lauren", xMul: 0, y: 0, z: 0.1, scale: [1.5, 1.5], speed: 0.22, preserveColor: false },
  { id: "ami-paris", xMul: 1, y: 0.15, z: 0, scale: [1.8, 1.05], speed: 0.16, preserveColor: true },
];

function BrandPlane({
  brand,
  isDark,
  spread,
  onClick,
}: {
  brand: BrandSpec;
  isDark: boolean;
  spread: number;
  onClick: () => void;
}) {
  const tex = useLoader(TextureLoader, `/brands/${brand.id}.png`);
  const meshRef = useRef<THREE.Mesh>(null);

  const x = brand.xMul * spread;
  const invert = isDark && !brand.preserveColor ? 1 : 0;

  useFrame((state, dt) => {
    if (!meshRef.current) return;
    const px = state.pointer?.x ?? 0;
    const py = state.pointer?.y ?? 0;
    const tx = THREE.MathUtils.clamp(px * 0.25, -0.25, 0.25);
    const ty = THREE.MathUtils.clamp(-py * 0.18, -0.18, 0.18);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      tx + x * 0.02,
      Math.min(1, dt * 4),
    );
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      ty,
      Math.min(1, dt * 4),
    );
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: tex },
        invert: { value: invert },
      },
      vertexShader: VS,
      fragmentShader: FS,
      transparent: true,
      depthWrite: false,
    });
    // Re-create only when texture changes; invert is updated via uniform below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tex]);

  useEffect(() => {
    material.uniforms.invert.value = invert;
  }, [invert, material]);

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    onClick();
  }

  return (
    <Float speed={brand.speed * 6} rotationIntensity={0.18} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        position={[x, brand.y, brand.z]}
        material={material}
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <planeGeometry args={brand.scale} />
      </mesh>
    </Float>
  );
}

function Scene({
  isDark,
  onSelect,
}: {
  isDark: boolean;
  onSelect: (id: BrandSpec["id"]) => void;
}) {
  const { viewport } = useThree();
  const spread = THREE.MathUtils.clamp(viewport.width * 0.32, 1.4, 2.6);

  return (
    <>
      <ambientLight intensity={1.2} />
      {BRANDS.map((b) => (
        <BrandPlane
          key={b.id}
          brand={b}
          isDark={isDark}
          spread={spread}
          onClick={() => onSelect(b.id)}
        />
      ))}
    </>
  );
}

export function BrandLogos3D({
  locale,
  className,
}: {
  locale: string;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const isDark = resolvedTheme === "dark";

  function onSelect(id: BrandSpec["id"]) {
    router.push(`/${locale}/shop?brand=${id}`);
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene isDark={isDark} onSelect={onSelect} />
      </Canvas>
    </div>
  );
}
