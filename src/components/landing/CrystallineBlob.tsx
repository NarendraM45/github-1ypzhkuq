import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";

const COLORS = ["#FF00CC", "#CC00FF", "#ff3df0"];

/**
 * CrystallineBlob — a jagged, organic 3D crystal mass with fresnel rim glow,
 * bright white-hot core, and additive outer bloom layers. Uses a high-detail
 * icosahedron with noise-based vertex displacement to produce the irregular,
 * spiky coral/crystal silhouette.
 */

const NOISE_GLSL = `
vec3  _m3(vec3 x){ return x-floor(x*(1./289.))*289.; }
vec4  _m4(vec4 x){ return x-floor(x*(1./289.))*289.; }
vec4  _pm(vec4 x){ return _m4(((x*34.)+1.)*x); }
vec4  _ti(vec4 r){ return 1.79284291400159-.85373472095314*r; }

float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i =floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g =step(x0.yzx,x0.xyz);
  vec3 l =1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=_m3(i);
  vec4 p=_pm(_pm(_pm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 xv=x_*ns.x+ns.yyyy; vec4 yv=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(xv)-abs(yv);
  vec4 b0=vec4(xv.xy,yv.xy); vec4 b1=vec4(xv.zw,yv.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 nm=_ti(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=nm.x; p1*=nm.y; p2*=nm.z; p3*=nm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

// ridged multi-fractal: adds sharp ridges (crystal spikiness)
float rmf(vec3 p){
  float v=0.0, a=0.55, f=1.0, freq=1.0, prev=1.0;
  for(int i=0;i<5;i++){
    float n = snoise(p*f);
    // ridged: 1 - |n| produces sharp peaks
    float r = 1.0 - abs(n);
    r *= r;
    // octave warping: perturb next frequency
    v += r * a * prev;
    prev = r;
    f *= 2.07;
    a *= 0.5;
  }
  return v;
}
`;

const BLOB_VERT = NOISE_GLSL + `
  uniform float uTime;
  uniform float uStr;
  varying vec3  vWN;
  varying vec3  vWP;
  varying float vRidge;

  void main(){
    vec3 p = position;
    float t = uTime * 0.18;

    // primary crystal displacement — ridged noise gives sharp spikes
    float ridge = rmf(p * 1.5 + vec3(0.0, 0.0, t));
    float n    = snoise(p * 0.9 + vec3(t * 0.6));

    // combine: ridged spikes + slower gentle noise breathing
    float disp = ridge * uStr + n * 0.12 * uStr;

    // add sharp facet-like secondary ridges for crystal edges
    float facet = rmf(p * 3.2 + vec3(t * 0.3));
    disp += facet * 0.18 * uStr;

    vec3 dispPos = p + normal * disp;
    vRidge = ridge;

    // reconstruct normal via finite differences of the same function
    const float E = 0.035;
    float rA = rmf((p + vec3(E,0.,0.)) * 1.5 + vec3(0.,0.,t));
    float rB = rmf((p - vec3(E,0.,0.)) * 1.5 + vec3(0.,0.,t));
    float rC = rmf((p + vec3(0.,E,0.)) * 1.5 + vec3(0.,0.,t));
    float rD = rmf((p - vec3(0.,E,0.)) * 1.5 + vec3(0.,0.,t));
    float rE2 = rmf((p + vec3(0.,0.,E)) * 1.5 + vec3(0.,0.,t));
    float rF = rmf((p - vec3(0.,0.,E)) * 1.5 + vec3(0.,0.,t));
    vec3 grad = vec3(rA - rB, rC - rD, rE2 - rF) / (2.0 * E);

    vec3 dN = normalize(normal - grad * uStr);

    vWN = normalize((modelMatrix * vec4(dN, 0.0)).xyz);
    vWP = (modelMatrix * vec4(dispPos, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWP, 1.0);
  }
`;

const BLOB_FRAG = `
  uniform vec3  uCP;
  uniform vec3  uColA;    // hot magenta #FF00CC
  uniform vec3  uColB;    // deep purple #CC00FF
  uniform vec3  uColC;    // dark violet base
  uniform float uTime;
  uniform float uEm;

  varying vec3  vWN;
  varying vec3  vWP;
  varying float vRidge;

  void main(){
    vec3 N  = normalize(vWN);
    vec3 V  = normalize(uCP - vWP);
    float NV = max(dot(N, V), 0.0);

    // strong fresnel rim — the crystal edge glows
    float fr  = pow(1.0 - NV, 2.4);
    float fr2 = pow(1.0 - NV, 1.2);

    // emissive core glow — peaks along ridges (facets catch light)
    float ridgeGlow = pow(vRidge, 1.5);
    vec3 core = mix(uColC, uColB, 0.4);
    vec3 em = mix(uColB, uColA, ridgeGlow);

    // white-hot center where ridges are highest
    vec3 whiteCore = vec3(1.0) * pow(ridgeGlow, 3.0) * 1.4;

    // dark crystal body with subtle internal gradient
    float nA = vRidge * 0.5 + 0.5;
    vec3 body = mix(vec3(0.06, 0.0, 0.10), vec3(0.22, 0.02, 0.28), nA);

    vec3 col = body;
    col += em  * fr   * 1.9;
    col += em  * fr2  * uEm * 0.6;
    col += whiteCore * uEm * 0.7;
    col += uColA * (1.0 - NV) * uEm * 0.35;

    // specular pop along facets
    vec3 L = normalize(vec3(1.0, 1.4, 0.8));
    float sp = pow(max(dot(reflect(-L, N), V), 0.0), 64.0);
    col += vec3(1.0, 0.7, 1.0) * sp * 0.45;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Blob({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uStr: { value: 0.55 },
      uCP: { value: new THREE.Vector3(0, 0, 5) },
      uColA: { value: new THREE.Color("#FF00CC") },
      uColB: { value: new THREE.Color("#CC00FF") },
      uColC: { value: new THREE.Color("#1A0530") },
      uEm: { value: 1.0 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      matRef.current.uniforms.uCP.value.copy(state.camera.position);
      // living breathing — emissive pulses
      const breathe = (Math.sin(t * 0.9) + 1) / 2;
      matRef.current.uniforms.uEm.value = 0.7 + breathe * 0.5;
    }
    if (mesh.current) {
      mesh.current.rotation.y += 0.0028;
      mesh.current.rotation.x += 0.0009;
      mesh.current.rotation.z += 0.0004;
      // gentle cursor-follow drift
      mesh.current.position.x += (pointer.current.x * 0.6 - mesh.current.position.x) * 0.04;
      mesh.current.position.y += (pointer.current.y * 0.4 - mesh.current.position.y) * 0.04;
    }
  });

  return (
    <mesh ref={mesh} position={[1.6, 0, 0]}>
      <icosahedronGeometry args={[1.3, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={BLOB_VERT}
        fragmentShader={BLOB_FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/** Additive outer glow halo — a larger transparent sphere with fresnel-only
 *  emission to extend bloom beyond the crystal silhouette. */
function Halo() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uCP: { value: new THREE.Vector3(0, 0, 5) },
      uColA: { value: new THREE.Color("#FF00CC") },
      uColB: { value: new THREE.Color("#CC00FF") },
    }),
    []
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uCP.value.copy(state.camera.position);
    }
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      const breathe = (Math.sin(t * 0.9) + 1) / 2;
      meshRef.current.scale.setScalar(1.0 + breathe * 0.08);
    }
  });

  const frag = `
    uniform vec3 uCP;
    uniform vec3 uColA;
    uniform vec3 uColB;
    varying vec3 vWN;
    varying vec3 vWP;
    void main(){
      vec3 N = normalize(vWN);
      vec3 V = normalize(uCP - vWP);
      float NV = max(dot(N, V), 0.0);
      float fr = pow(1.0 - NV, 2.2);
      vec3 col = mix(uColB, uColA, fr) * fr;
      gl_FragColor = vec4(col, fr * 0.7);
    }
  `;
  const vert = `
    varying vec3 vWN;
    varying vec3 vWP;
    void main(){
      vWN = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vWP = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * viewMatrix * vec4(vWP, 1.0);
    }
  `;

  return (
    <mesh ref={meshRef} position={[1.6, 0, 0]}>
      <sphereGeometry args={[2.0, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/** Floating crystal shards orbiting the main mass for depth. */
function Shards() {
  const group = useRef<THREE.Group>(null);
  const COUNT = 18;
  const shards = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 2.0 + Math.random() * 1.4,
        yOff: (Math.random() - 0.5) * 2.2,
        scale: 0.08 + Math.random() * 0.18,
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.rotation.y = t * 0.06;

    group.current.children.forEach((child, i) => {
      const s = shards[i];
      const a = s.angle + t * s.speed * 0.15;
      child.position.set(
        1.6 + Math.cos(a) * s.radius,
        s.yOff + Math.sin(t * s.speed + s.phase) * 0.15,
        Math.sin(a) * s.radius
      );
      child.rotation.x = t * s.speed;
      child.rotation.y = t * s.speed * 0.7;
      const pulse = (Math.sin(t * 1.5 + s.phase) + 1) / 2;
      child.scale.setScalar(s.scale * (0.85 + pulse * 0.3));
    });
  });

  return (
    <group ref={group}>
      {shards.map((_, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#FF00CC" : "#CC00FF"}
            emissive={i % 2 === 0 ? "#FF00CC" : "#CC00FF"}
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function CrystallineBlob({
  pointer,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2.0} color="#FF00CC" />
      <pointLight position={[-5, -3, 2]} intensity={1.4} color="#CC00FF" />
      <pointLight position={[1.6, 0, 2]} intensity={1.8} color="#ffffff" distance={4} />
      <Blob pointer={pointer} />
      <Halo />
      <Shards />
    </Canvas>
  );
}
