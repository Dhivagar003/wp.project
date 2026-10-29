"use client";
// One WebGL canvas for the whole site. Every 3D slot on the page is a drei <View> that draws
// into this canvas, so scrolling never re-creates contexts, re-loads the HDRI or recompiles shaders.
import { Canvas } from "@react-three/fiber";
import { View, Preload } from "@react-three/drei";
import * as THREE from "three";

export default function SceneRoot() {
  return (
    <Canvas
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5 }}
    >
      <View.Port />
      <Preload all />
    </Canvas>
  );
}
