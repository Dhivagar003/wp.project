"use client";
// Shared PBR materials, built once per finish so every view reuses compiled shaders.
import * as THREE from "three";
import type { Finish } from "@/lib/types";

// Measured base colours (sRGB) for polished alloys.
export const FINISH_COLOR: Record<Finish, string> = {
  yellow: "#f7c66b",
  rose: "#edb49e",
  white: "#dedfe2",
  silver: "#f0f1f3",
};

let polish: THREE.Texture | null = null;
// Faint procedural micro-scratch map so metal reads hand-polished, not CG-perfect.
function polishMap() {
  if (polish || typeof document === "undefined") return polish;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#7a7a7a";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const v = 90 + Math.random() * 90;
    g.strokeStyle = `rgba(${v},${v},${v},0.35)`;
    g.lineWidth = Math.random() * 0.8;
    const x = Math.random() * 256, y = Math.random() * 256, a = Math.random() * Math.PI, l = 6 + Math.random() * 30;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  polish = new THREE.CanvasTexture(c);
  polish.wrapS = polish.wrapT = THREE.RepeatWrapping;
  polish.repeat.set(3, 3);
  return polish;
}

const metals = new Map<Finish, THREE.MeshPhysicalMaterial>();
export function metal(f: Finish) {
  let m = metals.get(f);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({
      color: FINISH_COLOR[f], metalness: 1, roughness: f === "white" || f === "silver" ? 0.1 : 0.13,
      roughnessMap: polishMap(), envMapIntensity: 1.35, specularIntensity: 1,
    });
    metals.set(f, m);
  }
  return m;
}

export const pearl = new THREE.MeshPhysicalMaterial({
  color: "#f3ece0", roughness: 0.22, metalness: 0, sheen: 1, sheenRoughness: 0.35, sheenColor: new THREE.Color("#ffd6e4"),
  iridescence: 0.7, iridescenceIOR: 1.6, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.1,
});

export const blackBead = new THREE.MeshPhysicalMaterial({ color: "#050505", roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 });

// Tiny accent stones: refraction is overkill at this size; a faceted mirror reads as sparkle.
export const pave = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#5a6270", metalness: 1, roughness: 0.02, envMapIntensity: 4, flatShading: true });
