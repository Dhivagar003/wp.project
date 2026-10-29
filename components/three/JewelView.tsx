"use client";
import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { View, Environment, OrbitControls, PerspectiveCamera, Float, ContactShadows, Sparkles } from "@react-three/drei";
import type * as THREE from "three";
import { Jewel } from "./models";
import { HDRI } from "./gems";
import type { Finish, ModelType } from "@/lib/types";

export type JewelProps = {
  type: ModelType; finish: Finish; gem?: string | null; glb?: string | null;
  controls?: boolean; autoRotate?: boolean; sparkles?: boolean; scrollSpin?: boolean; shadow?: boolean;
  className?: string; zoom?: number;
};

const reduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function Spinner({ children, auto, scroll }: { children: ReactNode; auto: boolean; scroll: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    // sway rather than full spin so flat pieces never sit edge-on
    if (auto) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.75;
    if (scroll) {
      const p = Math.min(window.scrollY / window.innerHeight, 1.5);
      ref.current.rotation.x = p * 1.1;
      ref.current.position.y = p * 1.4;
    }
  });
  return <group ref={ref}>{children}</group>;
}

export default function JewelView({ type, finish, gem = null, glb, controls = false, autoRotate = true, sparkles = false, scrollSpin = false, shadow = true, className, zoom = 6 }: JewelProps) {
  const still = reduced();
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault position={[0, 0.35, zoom]} fov={34} />
      <Environment files={HDRI} environmentIntensity={1.05} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <Float speed={still ? 0 : 1.3} rotationIntensity={0.18} floatIntensity={0.35}>
        <Spinner auto={autoRotate && !controls && !still} scroll={scrollSpin}>
          <Jewel type={type} finish={finish} gem={gem} glb={glb} />
        </Spinner>
      </Float>
      {sparkles && !still && <Sparkles count={40} scale={6} size={2} speed={0.25} color="#f6d58e" />}
      {shadow && <ContactShadows position={[0, -2.1, 0]} opacity={0.45} scale={9} blur={2.6} far={4} frames={controls ? Infinity : 1} resolution={256} />}
      {controls && <OrbitControls makeDefault enablePan={false} minDistance={2.5} maxDistance={10} autoRotate={autoRotate && !still} autoRotateSpeed={0.9} />}
    </View>
  );
}
