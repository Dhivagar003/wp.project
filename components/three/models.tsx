"use client";
// Procedural jewellery modelled on real construction (comfort-fit shanks, claw settings,
// rope borders, granulated jhumkas). Geometry is built once at module level and shared.
import { useMemo, useRef, Suspense, type ComponentProps } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance, useGLTF } from "@react-three/drei";
import { Gem } from "./gems";
import { metal, pearl, blackBead, pave } from "./materials";
import { STONES, type Finish, type ModelType } from "@/lib/types";

export { FINISH_COLOR } from "./materials";

const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);

// Band whose cross-section is a comfort-fit "D": flat inside, domed outside. Lies in XZ, so callers rotate it.
function dBand(r: number, width: number, thick: number, seg = 160) {
  const pts: [number, number][] = [[r - thick * 0.15, -width]];
  for (let i = 0; i <= 18; i++) {
    const a = -Math.PI / 2 + (i / 18) * Math.PI;
    pts.push([r + Math.cos(a) * thick, Math.sin(a) * width]);
  }
  pts.push([r - thick * 0.15, width], [r - thick * 0.15, -width]);
  return lathe(pts, seg);
}

const G = {
  ringBand: dBand(1, 0.11, 0.09),
  kada: dBand(1.3, 0.24, 0.13, 200),
  bead: new THREE.SphereGeometry(1, 20, 14),
  prong: new THREE.CylinderGeometry(0.018, 0.032, 1, 10),
  link: new THREE.TorusGeometry(1, 0.28, 10, 28),
  // domed face so the polished coin catches a gradient of light instead of one flat (dark) reflection
  coin: lathe(([[0, 0.42], [0.35, 0.36], [0.7, 0.22], [0.95, 0.06], [1, 0], [1, -0.06], [0, -0.06]] as [number, number][]).reverse(), 48),
  rim: new THREE.TorusGeometry(1, 0.08, 10, 48),
  jhumkaDome: lathe(Array.from({ length: 28 }, (_, i) => { const t = i / 27; return [0.07 + Math.pow(Math.sin((t * Math.PI) / 2), 1.4) * 0.55, -t * 0.78] as [number, number]; }).reverse(), 64),
  cup: lathe(([[0, 0], [0.7, 0.12], [1, 0.45], [0.92, 0.5], [0.62, 0.2], [0, 0.12]] as [number, number][]).reverse(), 48),
  vati: lathe(([[0, 0.12], [0.18, 0.11], [0.3, 0.06], [0.34, 0], [0, 0]] as [number, number][]).reverse(), 64),
};

// Rope: two strands twisted around a circle of radius R, offset along the ring's axis.
class Rope extends THREE.Curve<THREE.Vector3> {
  constructor(private R: number, private y: number, private phase: number, private twists = 90, private a = 0.022) { super(); }
  getPoint(t: number, out = new THREE.Vector3()) {
    const u = t * Math.PI * 2, w = u * this.twists + this.phase;
    const r = this.R + Math.cos(w) * this.a;
    return out.set(Math.cos(u) * r, this.y + Math.sin(w) * this.a, Math.sin(u) * r);
  }
}
const ropeGeo = (R: number, y: number) => [0, Math.PI].map((p) => new THREE.TubeGeometry(new Rope(R, y, p), 900, 0.017, 6, true));
const KADA_ROPES = [...ropeGeo(1.42, 0.22), ...ropeGeo(1.42, -0.22)];

// A drape: shallow at the nape, deep at the front, with the front tilted toward the camera.
const drape = (w = 1.4, h = 1.8, y0 = 0.6) =>
  new THREE.CatmullRomCurve3(
    Array.from({ length: 32 }, (_, i) => {
      const a = (i / 32) * Math.PI * 2;
      return new THREE.Vector3(Math.sin(a) * w, Math.cos(a) * h * (Math.cos(a) > 0 ? 0.3 : 1) + y0, -Math.cos(a) * 0.35);
    }),
    true,
  );
const circle = (r: number) => new THREE.CatmullRomCurve3(Array.from({ length: 48 }, (_, i) => new THREE.Vector3(Math.cos((i / 48) * Math.PI * 2) * r, Math.sin((i / 48) * Math.PI * 2) * r, 0)), true);

function Metal({ finish, ...p }: { finish: Finish } & ComponentProps<"mesh">) {
  return <mesh material={metal(finish)} {...p} />;
}

/* ---------- RING: comfort-fit shank, 6-claw cathedral head, pavé shoulders ---------- */
function Ring({ finish, gem }: { finish: Finish; gem: string | null }) {
  const paveSpots = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const side = i < 7 ? 1 : -1, k = i % 7;
    const a = Math.PI / 2 + side * (0.2 + k * 0.085);
    return [Math.cos(a) * 1.085, Math.sin(a) * 1.085] as const;
  }), []);
  return (
    <group rotation={[0.35, 0, 0]}>
      <Metal finish={finish} geometry={G.ringBand} rotation={[Math.PI / 2, 0, 0]} />
      {gem ? (
        <group position={[0, 1.06, 0]}>
          {gem === STONES.Pearl ? (
            <>
              {/* pearl cup: pearls are glued onto a peg in a shallow cup, not held by claws */}
              <Metal finish={finish} geometry={G.cup} scale={0.2} position={[0, 0.02, 0]} />
              <Gem color={gem} size={0.36} position={[0, 0.3, 0]} />
            </>
          ) : (<>
          {/* gallery rail + claws */}
          <Metal finish={finish} geometry={G.rim} scale={0.2} position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]} />
          {Array.from({ length: 6 }, (_, i) => (
            <group key={i} rotation={[0, (i / 6) * Math.PI * 2, 0]}>
              <Metal finish={finish} geometry={G.prong} position={[0.2, 0.22, 0]} rotation={[0, 0, -0.32]} scale={[1, 0.46, 1]} />
              <Metal finish={finish} geometry={G.bead} position={[0.285, 0.44, 0]} scale={0.034} />
            </group>
          ))}
          <Gem color={gem} size={0.32} position={[0, 0.39, 0]} />
          </>)}
          <Instances geometry={G.bead} material={pave} limit={14}>
            {paveSpots.map(([x, y], i) => <Instance key={i} position={[x, y - 1.06, 0]} scale={0.03} />)}
          </Instances>
        </group>
      ) : (
        <Instances geometry={G.bead} material={metal(finish)} limit={120}>
          {Array.from({ length: 120 }, (_, i) => { const a = (i / 120) * Math.PI * 2; return <Instance key={i} position={[Math.cos(a), Math.sin(a), 0.115]} scale={0.014} />; })}
        </Instances>
      )}
    </group>
  );
}

/* ---------- KADA: domed band with twisted rope borders, milgrain and bezel stones ---------- */
function Bangle({ finish, gem }: { finish: Finish; gem: string | null }) {
  const m = metal(finish);
  return (
    <group rotation={[1.05, 0, 0.12]}>
      <mesh geometry={G.kada} material={m} />
      {KADA_ROPES.map((g, i) => <mesh key={i} geometry={g} material={m} />)}
      <Instances geometry={G.bead} material={m} limit={110}>
        {Array.from({ length: 110 }, (_, i) => { const a = (i / 110) * Math.PI * 2; return <Instance key={i} position={[Math.cos(a) * 1.435, 0, Math.sin(a) * 1.435]} scale={0.022} />; })}
      </Instances>
      {gem && Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI / 2 + (i - 4) * 0.2;
        return (
          <group key={i} position={[Math.cos(a) * 1.44, 0, Math.sin(a) * 1.44]} rotation={[0, -a + Math.PI / 2, 0]}>
            <Metal finish={finish} geometry={G.rim} scale={0.065} />
            <Gem color={gem} size={0.06} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]} />
          </group>
        );
      })}
    </group>
  );
}

/* ---------- CHAINS: interlocking oval links laid along a curve ---------- */
function Links({ curve, count, finish, size = 0.05 }: { curve: THREE.Curve<THREE.Vector3>; count: number; finish: Finish; size?: number }) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => {
    const t = i / count, p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tan);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), i % 2 ? Math.PI / 2 : 0));
    return { p, r: new THREE.Euler().setFromQuaternion(q) };
  }), [curve, count]);
  return (
    <Instances geometry={G.link} material={metal(finish)} limit={count}>
      {items.map((it, i) => <Instance key={i} position={it.p} rotation={it.r} scale={[size * 1.7, size, size]} />)}
    </Instances>
  );
}
const CHAIN = drape();
function Chain({ finish }: { finish: Finish }) {
  return <Links curve={CHAIN} count={210} finish={finish} size={0.045} />;
}
const WRIST = circle(1.05);
function Bracelet({ finish }: { finish: Finish }) {
  return (
    <group rotation={[0.55, 0, 0]}>
      <Links curve={WRIST} count={96} finish={finish} size={0.05} />
      {/* lobster clasp */}
      <group position={[0, -1.08, 0.02]}>
        <Metal finish={finish} geometry={G.bead} scale={[0.09, 0.05, 0.05]} />
        <Metal finish={finish} geometry={G.rim} scale={0.05} position={[0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
      </group>
    </group>
  );
}

/* ---------- PENDANT: bail + teardrop frame + pear stone with halo ---------- */
class Tear extends THREE.Curve<THREE.Vector3> {
  constructor() { super(); }
  getPoint(t: number, out = new THREE.Vector3()) {
    const u = t * Math.PI * 2; // narrow at the top, round at the bottom
    return out.set(Math.sin(u) * 0.34 * (1 - Math.cos(u) * 0.45), -Math.cos(u) * 0.46, 0);
  }
}
const TEAR_CURVE = new Tear();
const TEAR = new THREE.TubeGeometry(TEAR_CURVE, 120, 0.035, 10, true);
function PendantHead({ finish, gem }: { finish: Finish; gem: string | null }) {
  return (
    <group>
      <Metal finish={finish} geometry={G.rim} scale={0.075} position={[0, 0.56, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Metal finish={finish} geometry={TEAR} />
      <Instances geometry={G.bead} material={pave} limit={22}>
        {Array.from({ length: 22 }, (_, i) => { const p = TEAR_CURVE.getPoint(i / 22); return <Instance key={i} position={[p.x, p.y, 0.04]} scale={0.026} />; })}
      </Instances>
      {gem ? <Gem color={gem} shape="pear" size={0.26} position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]} /> : <Metal finish={finish} geometry={G.bead} scale={[0.22, 0.28, 0.08]} position={[0, -0.08, 0]} />}
    </group>
  );
}
function Pendant({ finish, gem }: { finish: Finish; gem: string | null }) {
  return (
    <group position={[0, 0.25, 0]}>
      <Links curve={CHAIN} count={230} finish={finish} size={0.032} />
      <group position={[0, -1.72, 0.36]} scale={1.15}><PendantHead finish={finish} gem={gem} /></group>
    </group>
  );
}

/* ---------- JHUMKA: flower stud, granulated filigree dome, pearl fringe ---------- */
function Jhumka({ finish, gem, x }: { finish: Finish; gem: string | null; x: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.3 + x) * 0.07; });
  const domeMat = useMemo(() => { const m = metal(finish).clone(); m.side = THREE.DoubleSide; return m; }, [finish]);
  return (
    <group position={[x, 0.95, 0]}>
      <group position={[0, 0.25, 0.02]}>
        {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return <Metal key={i} finish={finish} geometry={G.bead} scale={[0.09, 0.09, 0.05]} position={[Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0]} />; })}
        {gem ? <Gem color={gem} size={0.085} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]} /> : <Metal finish={finish} geometry={G.bead} scale={0.08} />}
      </group>
      <group ref={ref}>
        <Metal finish={finish} geometry={G.bead} scale={0.07} position={[0, 0.06, 0]} />
        <mesh geometry={G.jhumkaDome} material={domeMat} />
        {[0.3, 0.55, 0.77].map((t, k) => {
          const r = 0.07 + Math.pow(Math.sin((t * Math.PI) / 2), 1.4) * 0.55 + 0.01, n = 14 + k * 10;
          return (
            <Instances key={t} geometry={G.bead} material={metal(finish)} limit={n}>
              {Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return <Instance key={i} position={[Math.cos(a) * r, -t * 0.78, Math.sin(a) * r]} scale={0.024} />; })}
            </Instances>
          );
        })}
        <Instances geometry={G.bead} material={pearl} limit={20}>
          {Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return <Instance key={i} position={[Math.cos(a) * 0.6, -0.92, Math.sin(a) * 0.6]} scale={0.055} />; })}
        </Instances>
      </group>
    </group>
  );
}

/* ---------- TEMPLE NECKLACE: coin (kasu) drops, gem accents, centre pendant ---------- */
const HAAR = drape(1.5, 1.95, 0.75);
function Coin({ finish, s = 0.12 }: { finish: Finish; s?: number }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]} scale={s}>
      <Metal finish={finish} geometry={G.coin} />
      <Metal finish={finish} geometry={G.rim} position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.85} />
      <Metal finish={finish} geometry={G.bead} position={[0, 0.06, 0]} scale={[0.4, 0.2, 0.4]} />
    </group>
  );
}
function Necklace({ finish, gem }: { finish: Finish; gem: string | null }) {
  const n = 19;
  return (
    <group position={[0, 0.2, 0]}>
      <Links curve={HAAR} count={220} finish={finish} size={0.04} />
      {Array.from({ length: n }, (_, i) => {
        const p = HAAR.getPointAt((0.66 + (i / (n - 1)) * 0.68) % 1);
        return (
          <group key={i} position={[p.x, p.y - 0.17, p.z + 0.04]}>
            <Metal finish={finish} geometry={G.rim} scale={0.03} position={[0, 0.13, 0]} />
            <Coin finish={finish} />
            {gem && i % 2 === 0 && <Gem color={gem} size={0.045} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.07]} />}
          </group>
        );
      })}
      <group position={[0, -1.6, 0.42]}>
        <Coin finish={finish} s={0.3} />
        {gem && <Gem color={gem} size={0.1} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.15]} />}
        <Instances geometry={G.bead} material={pearl} limit={5}>
          {[-0.2, -0.1, 0, 0.1, 0.2].map((dx) => <Instance key={dx} position={[dx, -0.38 + Math.abs(dx) * 0.4, 0]} scale={0.05} />)}
        </Instances>
      </group>
    </group>
  );
}

/* ---------- MANGALSUTRA: double black-bead strand, gold spacers, twin vati ---------- */
const STRANDS = [drape(1.3, 1.85, 0.8), drape(1.36, 1.95, 0.8)];
function Mangalsutra({ finish }: { finish: Finish }) {
  const beads = 130;
  return (
    <group position={[0, 0.15, 0]}>
      {STRANDS.map((c, s) => (
        <group key={s}>
          <Instances geometry={G.bead} material={blackBead} limit={beads}>
            {Array.from({ length: beads }, (_, i) => (i % 10 ? <Instance key={i} position={c.getPointAt(i / beads)} scale={0.038} /> : null))}
          </Instances>
          <Instances geometry={G.bead} material={metal(finish)} limit={beads}>
            {Array.from({ length: beads }, (_, i) => (i % 10 ? null : <Instance key={i} position={c.getPointAt(i / beads)} scale={0.05} />))}
          </Instances>
        </group>
      ))}
      {[-0.36, 0.36].map((x) => (
        <group key={x} position={[x, -1.55, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <Metal finish={finish} geometry={G.vati} scale={[1, 1.6, 1]} />
          <Metal finish={finish} geometry={G.rim} scale={0.34} rotation={[Math.PI / 2, 0, 0]} />
          <Instances geometry={G.bead} material={metal(finish)} limit={24}>
            {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return <Instance key={i} position={[Math.cos(a) * 0.26, 0.09, Math.sin(a) * 0.26]} scale={0.02} />; })}
          </Instances>
        </group>
      ))}
    </group>
  );
}

function Glb({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const s = useMemo(() => {
    const c = scene.clone();
    const box = new THREE.Box3().setFromObject(c);
    const k = 3 / box.getSize(new THREE.Vector3()).length();
    c.scale.setScalar(k);
    c.position.sub(box.getCenter(new THREE.Vector3()).multiplyScalar(k));
    return c;
  }, [scene]);
  return <primitive object={s} />;
}

export function Jewel({ type, finish, gem, glb }: { type: ModelType; finish: Finish; gem: string | null; glb?: string | null }) {
  if (glb) return <Suspense fallback={null}><Glb url={glb} /></Suspense>;
  switch (type) {
    case "ring": return <Ring finish={finish} gem={gem} />;
    case "bangle": return <Bangle finish={finish} gem={gem} />;
    case "bracelet": return <Bracelet finish={finish} />;
    case "chain": return <group scale={0.85} position={[0, 0.15, 0]}><Chain finish={finish} /></group>;
    case "pendant": return <group scale={0.8} position={[0, 0.3, 0]}><Pendant finish={finish} gem={gem} /></group>;
    case "earring": return <><Jhumka finish={finish} gem={gem} x={-0.72} /><Jhumka finish={finish} gem={gem} x={0.72} /></>;
    case "necklace": return <group scale={0.8} position={[0, 0.3, 0]}><Necklace finish={finish} gem={gem} /></group>;
    case "mangalsutra": return <group scale={0.8} position={[0, 0.3, 0]}><Mangalsutra finish={finish} /></group>;
  }
}
