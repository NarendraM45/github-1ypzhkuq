import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const COLORS = ["#a855f7", "#7c3aed", "#e879f9"];

function Blob({
  pointer,
  disabled,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  disabled: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<any>(null);
  const colorIdx = useRef(0);
  const targetColor = useMemo(() => new THREE.Color(COLORS[0]), []);
  const currentColor = useMemo(() => new THREE.Color(COLORS[0]), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!mesh.current || !mat.current) return;

    // breathing — distort + scale sine cycle on --breathe
    const breathe = (Math.sin(t * (Math.PI * 2) / 4) + 1) / 2; // 0..1 over 4s
    mat.current.distort = 0.3 + breathe * 0.25;
    const scale = 1 + breathe * 0.06;
    mesh.current.scale.setScalar(scale);

    // color cycle at breathing peaks
    const peak = Math.pow(breathe, 3);
    currentColor.lerp(targetColor, 0.05);
    mat.current.color = currentColor;
    if (peak > 0.92) {
      colorIdx.current = (colorIdx.current + 1) % COLORS.length;
      targetColor.set(COLORS[colorIdx.current]);
    }

    if (!disabled) {
      mesh.current.position.x += (pointer.current.x * 1.2 - mesh.current.position.x) * 0.05;
      mesh.current.position.y += (pointer.current.y * 1.2 - mesh.current.position.y) * 0.05;
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.2, 16]} />
      <MeshDistortMaterial
        ref={mat}
        color={COLORS[0]}
        distort={0.4}
        speed={1.5}
        roughness={0.15}
        metalness={0.6}
        emissive={COLORS[1]}
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

function OrbitingParticles({
  pointer,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const COUNT = 220;
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 2.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.6;
      arr[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      arr[i * 3 + 1] = r * Math.sin(phi);
      arr[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
    }
    return arr;
  }, []);

  // Precomputed orbit params
  const orbits = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.5,
        radiusX: 0.9 + Math.random() * 0.3,
        radiusY: 0.9 + Math.random() * 0.3,
      })),
    []
  );

  const basePositions = useMemo(() => positions.slice(), [positions]);

  useFrame((state) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const t = state.clock.elapsedTime;
    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      const o = orbits[i];
      const ang = t * o.speed + o.phase;
      arr[i * 3] = basePositions[i * 3] + Math.cos(ang) * o.radiusX * 0.15;
      arr[i * 3 + 1] = basePositions[i * 3 + 1] + Math.sin(ang) * o.radiusY * 0.15;
      arr[i * 3 + 2] = basePositions[i * 3 + 2];
    }
    // light pull toward cursor
    arr;
    pos.needsUpdate = true;

    pts.rotation.y = t * 0.05;
    pts.rotation.x += (pointer.current.y * 0.2 - pts.rotation.x) * 0.03;
  });

  return (
    <Points ref={pointsRef as any} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#e879f9"
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function HeroBlob({
  disabled,
  pointer,
}: {
  disabled: boolean;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  if (disabled) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#e879f9" />
      <pointLight position={[-5, -3, 2]} intensity={0.8} color="#7c3aed" />
      <Blob pointer={pointer} disabled={disabled} />
      <OrbitingParticles pointer={pointer} />
    </Canvas>
  );
}
