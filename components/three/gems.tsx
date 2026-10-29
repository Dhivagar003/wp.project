"use client";
// Faceted gem cuts built from lathe profiles (flat-shaded, so every tier shows as real facets),
// rendered with ray-traced refraction for diamond fire.
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshRefractionMaterial, useEnvironment } from "@react-three/drei";
import { pearl } from "./materials";
import { STONES } from "@/lib/types";

export const HDRI = "/hdri/studio.hdr";

function cut(profile: [number, number][], facets: number) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), facets, Math.PI / facets).toNonIndexed();
  g.computeVertexNormals(); // non-indexed → one normal per facet
  return g;
}

// Round brilliant (girdle radius 1): culet, pavilion, girdle, crown (star tier), table.
// Profile order runs bottom → top; ideal-cut proportions (table 56%, crown 15%, pavilion 43%).
export const BRILLIANT = cut([[0, -0.86], [0.55, -0.42], [1, -0.03], [1, 0.03], [0.82, 0.17], [0.56, 0.3], [0, 0.3]], 16);
// Emerald (step) cut: few wide facets, square outline stretched later.
export const STEP = cut([[0, -0.5], [0.45, -0.38], [0.85, -0.15], [1, -0.02], [1, 0.02], [0.88, 0.14], [0.7, 0.24], [0, 0.24]], 4);

const COLORS: Record<string, string> = { "#f4f8ff": "#ffffff" };

const PEARL_GEO = new THREE.SphereGeometry(1, 48, 32);

export function Gem({ color, size = 0.35, position = [0, 0, 0], rotation = [0, 0, 0], shape = "round", spin = false }: {
  color: string; size?: number; position?: [number, number, number]; rotation?: [number, number, number]; shape?: "round" | "emerald" | "pear"; spin?: boolean;
}) {
  const env = useEnvironment({ files: HDRI });
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => { if (spin && ref.current) ref.current.rotation.y += d * 0.5; });
  const isDiamond = color === STONES.Diamond;
  if (color === STONES.Emerald && shape === "round") shape = "emerald"; // emeralds are traditionally step-cut
  const geom = shape === "emerald" ? STEP : BRILLIANT;
  const scale: [number, number, number] = shape === "emerald" ? [size * 1.35, size, size] : shape === "pear" ? [size * 0.78, size, size * 1.15] : [size, size, size];
  // boost diamonds above 1.0 so the face-up table glows like a lit stone instead of mirroring a dark room
  const tint = useMemo(() => new THREE.Color(COLORS[color] ?? color).multiplyScalar(isDiamond ? 1.7 : 1.25), [color, isDiamond]);
  // Pearls are organic and opaque: a lustrous sphere, never a faceted cut.
  if (color === STONES.Pearl) return <mesh geometry={PEARL_GEO} material={pearl} position={position} scale={size * 0.75} />;
  return (
    <mesh ref={ref} geometry={geom} position={position} rotation={rotation} scale={scale} rotation-order="YXZ">
      <MeshRefractionMaterial envMap={env} bounces={isDiamond ? 4 : 2} ior={isDiamond ? 2.42 : 1.77} fresnel={0.9}
        aberrationStrength={isDiamond ? 0.012 : 0.004} color={tint} fastChroma toneMapped={false} />
    </mesh>
  );
}
