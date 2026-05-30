import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sphere, Cylinder, MeshDistortMaterial, Torus, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function DNAHelix() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const pairs = 15;
  const nodes = [];

  for (let i = 0; i < pairs; i++) {
    const y = (i - pairs / 2) * 0.4;
    const angle = i * 0.6;
    const x = Math.cos(angle) * 1.5;
    const z = Math.sin(angle) * 1.5;

    nodes.push(
      <group key={i} position={[0, y, 0]}>
        {/* Connection */}
        <Cylinder args={[0.05, 0.05, 3]} rotation={[Math.PI / 2, 0, -angle]} receiveShadow castShadow>
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
        </Cylinder>
        {/* Left Node */}
        <Sphere args={[0.25, 32, 32]} position={[x, 0, z]} receiveShadow castShadow>
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
        </Sphere>
        {/* Right Node */}
        <Sphere args={[0.25, 32, 32]} position={[-x, 0, -z]} receiveShadow castShadow>
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
        </Sphere>
      </group>
    );
  }

  return <group ref={group}>{nodes}</group>;
}

export function DNAViewer({ className }: { className?: string }) {
  return (
    <div className={className || "w-full h-full min-h-[400px]"}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={2} castShadow penumbra={1} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00f0ff" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <DNAHelix />
        </Float>
        <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={15} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

function FloatingFlask() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.3;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={group} position={[0, -1, 0]}>
      {/* Base */}
      <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.9} 
          opacity={1} 
          metalness={0} 
          roughness={0}
          ior={1.5}
          thickness={0.5}
        />
      </Sphere>
      {/* Liquid inside */}
      <Sphere args={[1.4, 32, 32]} position={[0, -0.1, 0]} receiveShadow castShadow>
         <MeshDistortMaterial
          color="#00f0ff"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0}
        />
      </Sphere>
      {/* Neck */}
      <Cylinder args={[0.4, 0.6, 2.5]} position={[0, 2, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.9} 
          opacity={1} 
          metalness={0} 
          roughness={0}
          ior={1.5}
          thickness={0.5}
        />
      </Cylinder>
      {/* Rim */}
      <Cylinder args={[0.5, 0.5, 0.2]} position={[0, 3.25, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.9} 
          opacity={1} 
          metalness={0.1} 
          roughness={0.1}
          ior={1.5}
        />
      </Cylinder>
      {/* Small bubbles */}
      {[...Array(5)].map((_, i) => (
        <Sphere
          key={i}
          args={[0.1 * Math.random() + 0.05, 16, 16]}
          position={[
            (Math.random() - 0.5) * 1.5,
            Math.random() * 2,
            (Math.random() - 0.5) * 1.5,
          ]}
        >
          <meshStandardMaterial color="#ffffff" emissive="#00f0ff" emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

export function FlaskViewer({ className }: { className?: string }) {
  return (
    <div className={className || "w-full h-full min-h-[400px]"}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={3} castShadow penumbra={0.5} />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#00f0ff" />
        <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.5}>
          <FloatingFlask />
        </Float>
        <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={15} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

function FloatingMagnifyingGlass() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      group.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group} rotation={[0, 0, -Math.PI / 4]}>
      {/* Handle */}
      <Cylinder args={[0.15, 0.2, 2.5]} position={[0, -1.5, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Frame */}
      <Torus args={[1.2, 0.15, 16, 64]} position={[0, 1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#00f0ff" attach="material" metalness={0.6} roughness={0.2} />
      </Torus>
      {/* Glass */}
      <Cylinder args={[1.1, 1.1, 0.05, 32]} position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={1} 
          opacity={1} 
          metalness={0} 
          roughness={0}
          ior={1.2}
          thickness={0.5}
        />
      </Cylinder>
    </group>
  );
}

export function MagnifyingGlassViewer({ className }: { className?: string }) {
  return (
    <div className={className || "w-full h-full min-h-[400px]"}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={3} castShadow penumbra={0.5} />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#00f0ff" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <FloatingMagnifyingGlass />
        </Float>
        <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={15} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

function FloatingMicroscope() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.2;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, -1.5, 0]}>
      {/* Base */}
      <Cylinder args={[1.2, 1.2, 0.2, 32]} position={[0, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Arm Bottom/Pillar */}
      <Cylinder args={[0.3, 0.3, 2]} position={[-0.6, 1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#00f0ff" attach="material" metalness={0.6} roughness={0.2} />
      </Cylinder>
      {/* Stage */}
      <Cylinder args={[0.8, 0.8, 0.1, 32]} position={[0.2, 1.2, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Arm Curve (simplified as a box or angled cylinder) */}
      <Cylinder args={[0.3, 0.3, 2.5]} position={[-0.3, 2.5, 0]} rotation={[0, 0, Math.PI / 4]} receiveShadow castShadow>
        <meshStandardMaterial color="#00f0ff" attach="material" metalness={0.6} roughness={0.2} />
      </Cylinder>
      {/* Head */}
      <Cylinder args={[0.4, 0.4, 1.5]} position={[0.4, 3.2, 0]} rotation={[0, 0, -Math.PI / 8]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Eyepiece */}
      <Cylinder args={[0.15, 0.15, 0.8]} position={[0.6, 4, 0]} rotation={[0, 0, -Math.PI / 8]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Objective Lens */}
      <Cylinder args={[0.2, 0.1, 0.6]} position={[0.2, 2.3, 0]} rotation={[0, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#ffffff" attach="material" metalness={0.9} roughness={0.1} />
      </Cylinder>
      {/* Box base under objective */}
      <Cylinder args={[0.3, 0.4, 0.4]} position={[0.3, 2.7, 0]} rotation={[0, 0, -Math.PI / 8]} receiveShadow castShadow>
        <meshStandardMaterial color="#00f0ff" attach="material" metalness={0.6} roughness={0.2} />
      </Cylinder>
      {/* Glass Slide on Stage */}
      <Cylinder args={[0.3, 0.3, 0.05, 16]} position={[0.2, 1.3, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial 
          color="#00f0ff" 
          transmission={1} 
          opacity={0.8} 
          metalness={0} 
          roughness={0}
          ior={1.2}
          thickness={0.1}
        />
      </Cylinder>
    </group>
  );
}

export function MicroscopeViewer({ className }: { className?: string }) {
  return (
    <div className={className || "w-full h-full min-h-[400px]"}>
      <Canvas camera={{ position: [0, 1, 8], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={3} castShadow penumbra={0.5} />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#00f0ff" />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <FloatingMicroscope />
        </Float>
        <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={15} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
