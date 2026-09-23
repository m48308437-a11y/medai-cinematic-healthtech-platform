import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useRef } from "react";
import * as THREE from "three";

/** Breathing holographic heart — the MEDAI Vitality Core */

function Ring({ radius, color, opacity, tiltX, tiltZ, speed }: {
  radius: number; color: string; opacity: number; tiltX: number; tiltZ: number; speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * speed;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0.35, tiltZ]}>
      <torusGeometry args={[radius, 0.014, 12, 140]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

function OrbitNode({ radius, speed, offset, color, tilt }: {
  radius: number; speed: number; offset: number; color: string; tilt: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 1.6 + offset) * 0.55;
    ref.current?.position.set(x, y * Math.cos(tilt), z);
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function Core() {
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.03;
    glowRef.current?.scale.setScalar(s);
  });
  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.9}>
      {/* energy core */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.18, 64, 64]} />
        <MeshDistortMaterial
          color="#062a2b"
          emissive="#18e0c4"
          emissiveIntensity={0.85}
          roughness={0.18}
          metalness={0.65}
          distort={0.34}
          speed={2.1}
        />
      </mesh>
      {/* luminous nucleus */}
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial color="#2ffff0" toneMapped={false} />
      </mesh>
      {/* glass shell */}
      <mesh scale={1.34}>
        <sphereGeometry args={[1.18, 48, 48]} />
        <meshBasicMaterial color="#18e0c4" transparent opacity={0.07} depthWrite={false} toneMapped={false} />
      </mesh>
    </Float>
  );
}

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock }) => {
    if (!group.current) return;
    const targetY = pointer.x * 0.42;
    const targetX = -pointer.y * 0.3;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.045);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.045);
    const s = 1 + Math.sin(clock.elapsedTime * 0.6) * 0.015;
    group.current.scale.setScalar(s);
  });
  return <group ref={group}>{children}</group>;
}

export default function AICoreScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.35, 7.2], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.18} />
      <pointLight position={[5, 3, 4]} intensity={36} color="#18e0c4" />
      <pointLight position={[-6, -2.5, -3]} intensity={22} color="#5b8cff" />
      <pointLight position={[0, 4, -5]} intensity={14} color="#2ffff0" />

      <ParallaxRig>
        <Core />

        {/* gyroscopic holo rings */}
        <Ring radius={2.0} color="#2ffff0" opacity={0.9} tiltX={1.42} tiltZ={0.1} speed={0.35} />
        <Ring radius={2.45} color="#5b8cff" opacity={0.5} tiltX={1.12} tiltZ={-0.32} speed={-0.22} />
        <Ring radius={2.9} color="#18e0c4" opacity={0.28} tiltX={1.6} tiltZ={0.62} speed={0.13} />

        {/* orbiting light nodes */}
        <OrbitNode radius={2.0} speed={0.7} offset={0} color="#2ffff0" tilt={0.35} />
        <OrbitNode radius={2.0} speed={0.7} offset={Math.PI} color="#2ffff0" tilt={0.35} />
        <OrbitNode radius={2.45} speed={-0.45} offset={1.2} color="#5b8cff" tilt={-0.3} />
        <OrbitNode radius={2.45} speed={-0.45} offset={4.1} color="#5b8cff" tilt={-0.3} />
        <OrbitNode radius={2.9} speed={0.3} offset={2.4} color="#9dfef3" tilt={0.6} />

        {/* particle fields */}
        <Sparkles count={90} scale={[8, 6, 6]} size={2.2} speed={0.35} color="#2ffff0" opacity={0.6} />
        <Sparkles count={50} scale={[11, 8, 8]} size={3.4} speed={0.2} color="#5b8cff" opacity={0.45} />
      </ParallaxRig>

      <EffectComposer multisampling={0}>
        <Bloom intensity={1.25} luminanceThreshold={0.18} luminanceSmoothing={0.9} mipmapBlur radius={0.72} />
        <Vignette eskil={false} offset={0.22} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
