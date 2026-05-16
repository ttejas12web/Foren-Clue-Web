import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Environment, ContactShadows, PresentationControls, Float, Sparkles, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Info, MapPin, Flashlight, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Box, Square, Monitor } from 'lucide-react';

export interface Evidence {
  id: string;
  name: string;
  finding: string;
  position: [number, number, number];
  type: 'blood' | 'fingerprint' | 'weapon' | 'body' | 'glass' | 'generic';
}

interface CrimeSceneViewerProps {
  evidence: Evidence[];
  className?: string;
}

function InteractiveDoor({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const [isOpen, setIsOpen] = useState(false);
  const targetRotationY = isOpen ? Math.PI / 2.5 : 0;
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotationY, delta * 5);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Door Frame */}
      <mesh position={[0, 2.5, 0]}>
         <boxGeometry args={[3, 5, 0.3]} />
         <meshStandardMaterial color="#1e2224" roughness={0.9} />
      </mesh>
      {/* Inner Cutout (Dark space behind door) */}
      <mesh position={[0, 2.5, -0.1]}>
         <boxGeometry args={[2.8, 4.8, 0.1]} />
         <meshStandardMaterial color="#000" roughness={1} />
      </mesh>
      
      {/* Door Pivot */}
      <group position={[-1.4, 0, 0.1]} ref={ref}>
        {/* Door itself */}
        <mesh 
          position={[1.4, 2.5, 0]} 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
          castShadow
        >
          <boxGeometry args={[2.8, 4.8, 0.1]} />
          <meshStandardMaterial color="#303940" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Handle */}
        <mesh position={[2.5, 2.5, 0.1]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.1]} />
          <meshStandardMaterial color="#ccc" metalness={0.8} />
        </mesh>
        {/* Window in door */}
        <mesh position={[1.4, 3.5, 0]}>
           <boxGeometry args={[1.5, 1.2, 0.12]} />
           <meshStandardMaterial color="#111" roughness={0.1} metalness={0.8} transparent opacity={0.6}/>
        </mesh>

        {!isOpen && (
           <Html position={[1.4, 2.5, 0.1]} center>
              <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center animate-pulse pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-black/5 dark:bg-white/50" />
              </div>
           </Html>
        )}
      </group>
    </group>
  );
}

function InteractiveDrawer({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const targetPosZ = isOpen ? 1.2 : 0;
  const ref = useRef<THREE.Group>(null);
  const handleRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      // Elastic-feeling lerp
      ref.current.position.z += (targetPosZ - ref.current.position.z) * delta * 8;
    }
    if (handleRef.current) {
      const targetScale = hovered ? 1.1 : 1;
      handleRef.current.scale.setScalar(
        THREE.MathUtils.lerp(handleRef.current.scale.x, targetScale, delta * 10)
      );
    }
  });

  return (
    <group position={position} rotation={rotation} ref={ref}>
      <mesh 
        position={[0, 0, 0]} 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; setHovered(false); }}
        castShadow
      >
        <boxGeometry args={[3.8, 0.25, 1.8]} />
        <meshStandardMaterial color="#718093" roughness={0.5} />
        {/* Handle */}
        <mesh position={[0, 0, 0.95]} ref={handleRef}>
           <boxGeometry args={[0.8, 0.05, 0.2]} />
           <meshStandardMaterial 
              color={hovered ? "#f1c40f" : "#353b48"} 
              emissive={hovered ? "#f1c40f" : "#000000"} 
              emissiveIntensity={hovered ? 0.5 : 0}
              metalness={0.8} 
           />
        </mesh>
        
        {/* Hidden Item inside drawer */}
        <mesh position={[0.5, 0.1, 0.2]}>
           <boxGeometry args={[0.4, 0.05, 0.6]} />
           <meshStandardMaterial color="#fff" roughness={0.1} />
        </mesh>
        <mesh position={[-0.5, 0.1, 0]}>
           <boxGeometry args={[0.2, 0.05, 0.3]} />
           <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
        
        {!isOpen && !hovered && (
           <Html position={[0, 0, 1.1]} center>
              <div className="w-5 h-5 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center animate-pulse pointer-events-none">
                 <div className="w-1.5 h-1.5 rounded-full bg-black/5 dark:bg-white/50" />
              </div>
           </Html>
        )}
      </mesh>
    </group>
  );
}

function InteractiveLaptop({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const targetRotX = isOpen ? -Math.PI / 1.8 : 0; 
  const screenRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (screenRef.current) {
      screenRef.current.rotation.x += (targetRotX - screenRef.current.rotation.x) * delta * 8;
    }
  });

  return (
    <group position={position} rotation={rotation}>
       {/* Base */}
       <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[1.2, 0.04, 0.8]} />
          <meshStandardMaterial color="#a4b0be" metalness={0.8} roughness={0.3} />
       </mesh>
       {/* Keyboard */}
       <mesh position={[0, 0.045, 0.1]}>
          <boxGeometry args={[1.0, 0.01, 0.35]} />
          <meshStandardMaterial color="#2f3542" roughness={0.9} />
       </mesh>
       
       {/* Screen Pivot */}
       <group position={[0, 0.04, -0.38]} ref={screenRef}>
          {/* Screen Body */}
          <mesh 
            position={[0, 0, 0.4]} 
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHovered(true); }}
            onPointerOut={(e) => { document.body.style.cursor = 'auto'; setHovered(false); }}
            castShadow
          >
            <boxGeometry args={[1.2, 0.04, 0.8]} />
            <meshStandardMaterial 
              color={hovered ? "#b2bec3" : "#a4b0be"} 
              emissive={hovered ? "#ffffff" : "#000000"}
              emissiveIntensity={hovered ? 0.1 : 0}
              metalness={0.8} 
              roughness={0.3} 
            />
          </mesh>
          {/* Display */}
          <mesh position={[0, -0.021, 0.4]}>
            <boxGeometry args={[1.1, 0.01, 0.7]} />
            <meshStandardMaterial color={isOpen ? "#00f0ff" : "#111"} emissive={isOpen ? "#00f0ff" : "#000"} emissiveIntensity={isOpen ? 0.5 : 0} />
          </mesh>

          {!isOpen && !hovered && (
           <Html position={[0, 0, 0.8]} center>
              <div className="w-5 h-5 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center animate-pulse pointer-events-none">
                 <div className="w-1.5 h-1.5 rounded-full bg-warning/80" />
              </div>
           </Html>
        )}
       </group>
    </group>
  );
}

function InteractiveLocker({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const targetRotY = isOpen ? Math.PI / 1.5 : 0;
  const doorRef = useRef<THREE.Group>(null);
  const handleRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (doorRef.current) {
      doorRef.current.rotation.y += (targetRotY - doorRef.current.rotation.y) * delta * 8;
    }
    if (handleRef.current) {
      const targetScale = hovered ? 1.2 : 1;
      handleRef.current.scale.setScalar(
        THREE.MathUtils.lerp(handleRef.current.scale.x, targetScale, delta * 10)
      );
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Locker Body */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 5, 1]} />
        <meshStandardMaterial color="#333" roughness={0.7} metalness={0.4} />
      </mesh>
      
      {/* Shelves */}
      <mesh position={[0, 1.5, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.05, 0.8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 2.5, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.05, 0.8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 3.5, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.05, 0.8]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Hidden Evidence on Shelf */}
      <group position={[-0.5, 1.55, 0.5]}>
         <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color="#ff3333" roughness={0.2} />
         </mesh>
         {isOpen && (
           <Html position={[0, 0.3, 0]} center scale={0.5} zIndexRange={[100, 0]}>
             <div className="bg-warning/20 border border-warning/50 text-warning px-2 py-1 rounded text-[8px] whitespace-nowrap backdrop-blur-sm pointer-events-none">
                HIDDEN CHEMICALS
             </div>
           </Html>
         )}
      </group>

      {/* Door Pivot */}
      <group position={[-1, 0, 0.5]} ref={doorRef}>
        <mesh 
          position={[1, 2.5, 0.05]} 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHovered(true); }}
          onPointerOut={(e) => { document.body.style.cursor = 'auto'; setHovered(false); }}
          castShadow
        >
          <boxGeometry args={[2, 4.9, 0.1]} />
          <meshStandardMaterial color="#444" roughness={0.6} metalness={0.5} />
        </mesh>
        
        <mesh position={[1.8, 2.5, 0.15]} ref={handleRef} castShadow>
          <boxGeometry args={[0.05, 0.6, 0.1]} />
          <meshStandardMaterial 
            color={hovered ? "#f1c40f" : "#aaa"} 
            emissive={hovered ? "#f1c40f" : "#000000"}
            emissiveIntensity={hovered ? 0.5 : 0}
            metalness={0.8} 
          />
        </mesh>
        
        {!isOpen && !hovered && (
           <Html position={[1, 2.5, 0.1]} center>
              <div className="w-5 h-5 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center animate-pulse pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-black/5 dark:bg-white/50" />
              </div>
           </Html>
        )}
      </group>
    </group>
  );
}

function FlashlightLight() {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const { camera, pointer, raycaster, scene } = useThree();
  
  useEffect(() => {
    scene.add(targetRef.current);
    if (lightRef.current) {
      lightRef.current.target = targetRef.current;
    }
    return () => { scene.remove(targetRef.current); };
  }, [scene]);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  useFrame(() => {
    if (!lightRef.current) return;
    
    raycaster.setFromCamera(pointer, camera);
    const targetPos = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, targetPos);
    
    if (targetPos) {
      targetRef.current.position.lerp(targetPos, 0.2);
    } else {
       const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5).unproject(camera);
       const dir = vector.sub(camera.position).normalize();
       const distance = -camera.position.y / dir.y;
       targetPos.copy(camera.position.clone().add(dir.multiplyScalar(distance)));
       targetRef.current.position.lerp(targetPos, 0.2);
    }
    
    lightRef.current.position.copy(camera.position).add(new THREE.Vector3(0, 0.2, 0));
  });

  return (
    <spotLight 
      ref={lightRef} 
      color="#ffffff" 
      intensity={8} 
      angle={0.25} 
      penumbra={0.3} 
      distance={80} 
      castShadow
      shadow-mapSize={[1024, 1024]}
    />
  );
}

function Room() {
  return (
    <group>
      {/* Floor - Realistic Dark Lab Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial 
          color="#1a1c23" 
          roughness={0.4} 
          metalness={0.5} 
          envMapIntensity={0.8}
        />
      </mesh>
      
      {/* Subtle Grid for laboratory feel */}
      <gridHelper args={[24, 48, "#2d3436", "#2d3436"]} position={[0, -0.04, 0]} />
      
      {/* Walls - Dark Industrial */}
      <mesh position={[0, 5, -12]} receiveShadow>
        <boxGeometry args={[24, 10, 0.2]} />
        <meshStandardMaterial color="#2d3436" roughness={0.9} />
      </mesh>
      <mesh position={[-12, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[24, 10, 0.2]} />
        <meshStandardMaterial color="#2d3436" roughness={0.9} />
      </mesh>
      
      {/* Lab Furniture - Metal Tables */}
      <group position={[-6, 0, -7]}>
        {/* Table Top */}
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.05, 2]} />
          <meshStandardMaterial color="#7f8fa6" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Table Legs */}
        <mesh position={[-1.9, 0.55, -0.9]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.1]} />
          <meshStandardMaterial color="#353b48" metalness={0.9} />
        </mesh>
        <mesh position={[1.9, 0.55, -0.9]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.1]} />
          <meshStandardMaterial color="#353b48" metalness={0.9} />
        </mesh>
        <mesh position={[-1.9, 0.55, 0.9]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.1]} />
          <meshStandardMaterial color="#353b48" metalness={0.9} />
        </mesh>
        <mesh position={[1.9, 0.55, 0.9]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.1]} />
          <meshStandardMaterial color="#353b48" metalness={0.9} />
        </mesh>
        {/* Table Drawer */}
        <InteractiveDrawer position={[0, 1.05, -0.1]} rotation={[0, 0, 0]} />
        <InteractiveLaptop position={[1, 1.15, 0]} rotation={[0, -0.3, 0]} />
      </group>

      <group position={[7, 0, -3]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 0.05, 1.5]} />
          <meshStandardMaterial color="#7f8fa6" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-2.4, 0.55, -0.7]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.1]} />
          <meshStandardMaterial color="#353b48" metalness={0.9} />
        </mesh>
        <mesh position={[2.4, 0.55, -0.7]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.1]} />
          <meshStandardMaterial color="#353b48" metalness={0.9} />
        </mesh>
        <mesh position={[-2.4, 0.55, 0.7]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.1]} />
          <meshStandardMaterial color="#353b48" metalness={0.9} />
        </mesh>
        <mesh position={[2.4, 0.55, 0.7]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.1]} />
          <meshStandardMaterial color="#353b48" metalness={0.9} />
        </mesh>
      </group>
      
      {/* Secure Crime Scene Perimeter around Center */}
      <group position={[0, 0, 0]}>
         {/* Posts */}
         {[-1.5, 1.5].map((x) => 
           [-1.5, 1.5].map((z) => (
             <mesh key={`${x}-${z}`} position={[x, 0.4, z]} castShadow>
               <cylinderGeometry args={[0.03, 0.05, 0.8]} />
               <meshStandardMaterial color="#111" metalness={0.8} />
               <mesh position={[0, 0.4, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.05]} />
                  <meshStandardMaterial color="#333" />
               </mesh>
             </mesh>
           ))
         )}
         
         {/* Warning Tapes */}
         {/* Front Tape */}
         <mesh position={[0, 0.7, 1.5]} castShadow>
            <planeGeometry args={[3.0, 0.1]} />
            <meshStandardMaterial color="#f1c40f" roughness={0.8} side={THREE.DoubleSide} />
            <Html position={[0, 0, 0.01]} center transform distanceFactor={2}>
              <div className="bg-[#f1c40f] text-black font-black uppercase text-[50px] tracking-tighter px-4 py-0 whitespace-nowrap overflow-hidden flex justify-center" style={{ width: '600px', height: '60px', borderTop: '2px solid #000', borderBottom: '2px solid #000'}}>
                 <div className="flex items-center space-x-12" style={{ transform: 'scale(1, 0.8)' }}>
                    <span>CRIME SCENE DO NOT CROSS</span>
                    <span>CRIME SCENE DO NOT CROSS</span>
                 </div>
              </div>
            </Html>
         </mesh>
         
         {/* Back Tape */}
         <mesh position={[0, 0.7, -1.5]} rotation={[0, Math.PI, 0]} castShadow>
            <planeGeometry args={[3.0, 0.1]} />
            <meshStandardMaterial color="#f1c40f" roughness={0.8} />
            <Html position={[0, 0, 0.01]} center transform distanceFactor={2}>
              <div className="bg-[#f1c40f] text-black font-black uppercase text-[50px] tracking-tighter px-4 py-0 whitespace-nowrap overflow-hidden flex justify-center" style={{ width: '600px', height: '60px', borderTop: '2px solid #000', borderBottom: '2px solid #000'}}>
                 <div className="flex items-center space-x-12" style={{ transform: 'scale(1, 0.8)' }}>
                    <span>CRIME SCENE DO NOT CROSS</span>
                    <span>CRIME SCENE DO NOT CROSS</span>
                 </div>
              </div>
            </Html>
         </mesh>
         
         {/* Left Tape */}
         <mesh position={[-1.5, 0.7, 0]} rotation={[0, -Math.PI/2, 0]} castShadow>
            <planeGeometry args={[3.0, 0.1]} />
            <meshStandardMaterial color="#f1c40f" roughness={0.8} />
            <Html position={[0, 0, 0.01]} center transform distanceFactor={2}>
              <div className="bg-[#f1c40f] text-black font-black uppercase text-[50px] tracking-tighter px-4 py-0 whitespace-nowrap overflow-hidden flex justify-center" style={{ width: '600px', height: '60px', borderTop: '2px solid #000', borderBottom: '2px solid #000'}}>
                 <div className="flex items-center space-x-12" style={{ transform: 'scale(1, 0.8)' }}>
                    <span>CRIME SCENE DO NOT CROSS</span>
                    <span>CRIME SCENE DO NOT CROSS</span>
                 </div>
              </div>
            </Html>
         </mesh>
         
         {/* Right Tape */}
         <mesh position={[1.5, 0.7, 0]} rotation={[0, Math.PI/2, 0]} castShadow>
            <planeGeometry args={[3.0, 0.1]} />
            <meshStandardMaterial color="#f1c40f" roughness={0.8} />
            <Html position={[0, 0, 0.01]} center transform distanceFactor={2}>
              <div className="bg-[#f1c40f] text-black font-black uppercase text-[50px] tracking-tighter px-4 py-0 whitespace-nowrap overflow-hidden flex justify-center" style={{ width: '600px', height: '60px', borderTop: '2px solid #000', borderBottom: '2px solid #000'}}>
                 <div className="flex items-center space-x-12" style={{ transform: 'scale(1, 0.8)' }}>
                    <span>CRIME SCENE DO NOT CROSS</span>
                    <span>CRIME SCENE DO NOT CROSS</span>
                 </div>
              </div>
            </Html>
         </mesh>

         {/* Middle Ground Blood Splash */}
         <group position={[0, -0.04, 0]}>
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0.2, 0, -0.2]} scale={[1.2, 0.8, 1]}>
               <circleGeometry args={[0.6, 16]} />
               <meshStandardMaterial 
                 color="#8b0000" 
                 transparent 
                 opacity={0.8} 
                 roughness={0.1}
                 depthWrite={false}
               />
            </mesh>
            <mesh rotation={[-Math.PI/2, 0, Math.PI/4]} position={[-0.4, 0, 0.3]}>
               <circleGeometry args={[0.5, 16]} />
               <meshStandardMaterial color="#5e0000" transparent opacity={0.6} roughness={0.1} depthWrite={false} />
            </mesh>
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0.5, 0.001, 0.5]}>
               <circleGeometry args={[0.3, 16]} />
               <meshStandardMaterial color="#4a0000" transparent opacity={0.7} roughness={0.1} depthWrite={false} />
            </mesh>
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[-0.8, 0, -0.1]}>
               <circleGeometry args={[0.4, 16]} />
               <meshStandardMaterial color="#660000" transparent opacity={0.5} roughness={0.1} depthWrite={false} />
            </mesh>
         </group>
      </group>
      
      {/* Lockers */}
      <InteractiveLocker position={[-8, 0, -11]} rotation={[0, 0, 0]} />
      <InteractiveLocker position={[-10.1, 0, -11]} rotation={[0, 0, 0]} />
      
      {/* Main Door */}
      <InteractiveDoor position={[0, 0, -11.9]} rotation={[0, 0, 0]} />
    </group>
  );
}

function Marker({ 
  item, 
  onSelect, 
  isSelected,
  isDiscovered,
  onDiscover,
  flashlightMode
}: { 
  item: Evidence; 
  onSelect: (item: Evidence) => void; 
  isSelected: boolean;
  isDiscovered: boolean;
  onDiscover: () => void;
  flashlightMode: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  if (!item.position || !Array.isArray(item.position) || item.position.length < 3) return null;

  if (flashlightMode && !isDiscovered) {
    return (
      <Html position={[item.position[0], item.position[1] + 0.1, item.position[2]]} center distanceFactor={10} zIndexRange={[100, 0]}>
        <div 
          className="w-24 h-24 cursor-pointer flex items-center justify-center -translate-y-4"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => {
             e.stopPropagation();
             onDiscover();
          }}
        >
           {hovered && (
             <div className="w-12 h-12 rounded-full bg-warning/30 blur-md animate-pulse border-2 border-warning/50 shadow-[0_0_20px_rgba(255,191,0,0.5)] flex items-center justify-center pointer-events-none">
               <span className="text-[8px] font-black uppercase text-text-main tracking-widest drop-shadow-md">Identify</span>
             </div>
           )}
        </div>
      </Html>
    );
  }

  return (
    <Html position={[item.position[0], item.position[1] + 0.5, item.position[2]]} center distanceFactor={10}>
      <motion.div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect(item)}
        initial={{ scale: 0 }}
        animate={{ scale: isSelected ? 1.4 : 1 }}
        whileHover={{ scale: 1.2 }}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300 ${
          isSelected 
            ? 'bg-warning border-white text-crust ring-4 ring-warning/30 scale-110' 
            : hovered 
              ? 'bg-crust border-warning text-warning' 
              : 'bg-white border-crust text-crust'
        }`}>
          <MapPin size={isSelected ? 18 : 16} strokeWidth={isSelected ? 3 : 2} />
        </div>
        
        <AnimatePresence>
          {(hovered || isSelected) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-surface border rounded-lg shadow-xl pointer-events-none z-50 text-center ${
                isSelected ? 'border-warning' : 'border-warning/50'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-warning mb-1">{item.name}</p>
              <p className="text-[10px] text-text-muted leading-tight">
                {isSelected ? 'Currently Inspecting' : 'Click to view findings'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Html>
  );
}

function CameraHandler({ 
  selectedEvidence,
  cameraView,
  panDelta,
  zoomDelta
}: { 
  selectedEvidence: Evidence | null,
  cameraView: string,
  panDelta: {x: number, y: number},
  zoomDelta: number
}) {
  const { camera, controls } = useThree();
  const targetVector = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_state, delta) => {
    const ctrl = controls as any;
    if (ctrl) {
      if (panDelta.x !== 0 || panDelta.y !== 0) {
        // Pan horizontally based on camera rotation. OrbitControls manages target and camera position together on pan.
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        // Only use horizontal components for panning to keep it ground-parallel
        right.y = 0; right.normalize();
        
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0; forward.normalize();

        ctrl.target.addScaledVector(right, panDelta.x * delta * 15);
        ctrl.target.addScaledVector(forward, panDelta.y * delta * 15);
        camera.position.addScaledVector(right, panDelta.x * delta * 15);
        camera.position.addScaledVector(forward, panDelta.y * delta * 15);
      }

      if (zoomDelta !== 0) {
        // Basic zoom logic by moving camera towards/away from target
        const dir = camera.position.clone().sub(ctrl.target).normalize();
        camera.position.addScaledVector(dir, zoomDelta * delta * 15);
      }
    }

    if (selectedEvidence && Array.isArray(selectedEvidence.position) && selectedEvidence.position.length >= 3) {
      // Pan to evidence
      targetVector.current.lerp(new THREE.Vector3(...selectedEvidence.position), 0.1);
      
      // Calculate a zoom-in position 
      const evidencePos = new THREE.Vector3(...selectedEvidence.position);
      const idealCameraPos = evidencePos.clone().add(new THREE.Vector3(2.5, 2, 2.5));
      if (ctrl) ctrl.target.lerp(targetVector.current, 0.1);
      camera.position.lerp(idealCameraPos, delta * 2);
    } else if (cameraView !== 'free') {
      let idealTarget = new THREE.Vector3(0, 0, 0);
      let idealCamera = new THREE.Vector3(8, 6, 8);
      
      if (cameraView === 'top') {
        idealCamera = new THREE.Vector3(0, 14, 0.01); 
      } else if (cameraView === 'front') {
        idealCamera = new THREE.Vector3(0, 2, 12);
      } else {
        idealCamera = new THREE.Vector3(8, 6, 8); // isometric
      }

      if (ctrl) ctrl.target.lerp(idealTarget, 0.05);
      camera.position.lerp(idealCamera, 0.05);
    }
  });

  return null;
}

function EvidenceObjects({ evidence }: { evidence: Evidence[] }) {
  if (!Array.isArray(evidence)) return null;
  return (
    <>
      {evidence.map((item, idx) => {
        if (!item.position || !Array.isArray(item.position) || item.position.length < 3) return null;
        return (
        <group key={`${item.id}-${idx}`} position={item.position as [number, number, number]}>
          {item.type === 'blood' && (
            <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, 0]}>
              <mesh receiveShadow>
                <circleGeometry args={[0.6, 32]} />
                <meshStandardMaterial color="#4a0000" roughness={0.1} metalness={0.3} transparent opacity={0.8} depthWrite={false} />
              </mesh>
              <mesh position={[0.4, 0.2, 0]}>
                <circleGeometry args={[0.2, 16]} />
                <meshStandardMaterial color="#4a0000" roughness={0.1} metalness={0.3} transparent opacity={0.8} depthWrite={false} />
              </mesh>
              <mesh position={[-0.3, -0.4, 0]}>
                <circleGeometry args={[0.3, 16]} />
                <meshStandardMaterial color="#3a0000" roughness={0.1} metalness={0.3} transparent opacity={0.8} depthWrite={false} />
              </mesh>
              <mesh position={[-0.1, 0.5, 0]}>
                <circleGeometry args={[0.15, 16]} />
                <meshStandardMaterial color="#4a0000" roughness={0.1} metalness={0.3} transparent opacity={0.8} depthWrite={false} />
              </mesh>
            </group>
          )}
          {item.type === 'fingerprint' && (
            <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, 0]}>
              <mesh>
                <planeGeometry args={[0.5, 0.5]} />
                <meshStandardMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={0.15} 
                  roughness={0.5}
                  depthWrite={false}
                />
              </mesh>
              <gridHelper args={[0.5, 8, "#00f0ff", "#00f0ff"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.001]} />
            </group>
          )}
          {item.type === 'weapon' && (
            <group position={[0, 0.05, 0]} rotation={[0, Math.PI / 3, 0]}>
              {/* Handgun form */}
              {/* Barrel */}
              <mesh castShadow position={[0.2, 0, 0]}>
                <boxGeometry args={[0.4, 0.04, 0.06]} />
                <meshStandardMaterial color="#1f1f1f" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Grip */}
              <mesh position={[-0.1, -0.1, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
                <boxGeometry args={[0.15, 0.2, 0.05]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
              </mesh>
              {/* Trigger guard */}
              <mesh position={[0.0, -0.05, 0]} rotation={[0, 0, 0]}>
                 <torusGeometry args={[0.03, 0.01, 8, 16, Math.PI]} />
                 <meshStandardMaterial color="#1f1f1f" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Evidence Tent nearby */}
              <mesh position={[-0.4, 0.05, -0.2]} rotation={[0, 0, Math.PI / 4]}>
                 <boxGeometry args={[0.15, 0.15, 0.1]} />
                 <meshStandardMaterial color="#f1c40f" roughness={0.8} />
              </mesh>
            </group>
          )}
        {item.type === 'body' && (
          <group rotation={[0, Math.PI / 4, 0]}>
            {/* Chalk Outline */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
              <planeGeometry args={[2.5, 3.5]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.0} />
            </mesh>
            
            {/* Detailed Mannequin Body */}
            <group position={[0, 0.05, 0]}>
              {/* Pelvis */}
              <mesh position={[-0.2, 0.05, 0]} rotation={[0, 0, 0.1]} castShadow>
                <boxGeometry args={[0.25, 0.15, 0.3]} />
                <meshStandardMaterial color="#0984e3" roughness={0.9} />
              </mesh>

              {/* Torso/Chest */}
              <mesh position={[0.15, 0.08, 0]} rotation={[0, 0, -0.1]} castShadow>
                <boxGeometry args={[0.4, 0.2, 0.35]} />
                <meshStandardMaterial color="#2d3436" roughness={0.9} />
              </mesh>

              {/* Head */}
              <mesh position={[0.55, 0.08, 0]} rotation={[0.2, 0.5, 0]} castShadow>
                <sphereGeometry args={[0.12, 32, 32]} />
                <meshStandardMaterial color="#eecbaf" roughness={0.4} />
              </mesh>
              
              {/* Neck */}
              <mesh position={[0.4, 0.05, 0]} rotation={[0, 0, -1.5]} castShadow>
                <cylinderGeometry args={[0.05, 0.06, 0.15]} />
                <meshStandardMaterial color="#eecbaf" roughness={0.4} />
              </mesh>

              {/* Right Arm */}
              <group position={[0.2, 0.1, 0.22]}>
                {/* Upper Arm */}
                <mesh position={[0, 0, 0.15]} rotation={[-0.5, 0, 0.3]} castShadow>
                  <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
                  <meshStandardMaterial color="#2d3436" roughness={0.9} />
                </mesh>
                {/* Lower Arm */}
                <mesh position={[0.1, 0, 0.35]} rotation={[-1, 0, 0.2]} castShadow>
                  <capsuleGeometry args={[0.05, 0.2, 8, 8]} />
                  <meshStandardMaterial color="#eecbaf" roughness={0.6} />
                </mesh>
                {/* Hand */}
                <mesh position={[0.2, 0.02, 0.45]} rotation={[-1, 0, 0.2]} castShadow>
                  <boxGeometry args={[0.08, 0.04, 0.08]} />
                  <meshStandardMaterial color="#eecbaf" roughness={0.6} />
                </mesh>
              </group>

              {/* Left Arm */}
              <group position={[0.2, 0.05, -0.22]} rotation={[0.4, 0, -0.3]}>
                {/* Upper Arm */}
                <mesh position={[0.1, 0, -0.15]} rotation={[1.5, 0, 0]} castShadow>
                  <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
                  <meshStandardMaterial color="#2d3436" roughness={0.9} />
                </mesh>
                {/* Lower Arm */}
                <mesh position={[0.1, -0.05, -0.4]} rotation={[1.5, 0.3, 0]} castShadow>
                  <capsuleGeometry args={[0.05, 0.2, 8, 8]} />
                  <meshStandardMaterial color="#eecbaf" roughness={0.6} />
                </mesh>
                {/* Hand */}
                <mesh position={[0.1, -0.08, -0.55]} rotation={[1.5, 0, 0]} castShadow>
                  <boxGeometry args={[0.08, 0.04, 0.08]} />
                  <meshStandardMaterial color="#eecbaf" roughness={0.6} />
                </mesh>
              </group>

              {/* Right Leg */}
              <group position={[-0.3, 0.05, 0.1]}>
                {/* Thigh */}
                <mesh position={[-0.2, 0, 0.1]} rotation={[-0.3, 0, 1.5]} castShadow>
                  <capsuleGeometry args={[0.08, 0.35, 8, 8]} />
                  <meshStandardMaterial color="#0984e3" roughness={0.8} />
                </mesh>
                {/* Calf */}
                <mesh position={[-0.6, 0, 0.2]} rotation={[-0.5, 0, 1.5]} castShadow>
                  <capsuleGeometry args={[0.07, 0.35, 8, 8]} />
                  <meshStandardMaterial color="#0984e3" roughness={0.8} />
                </mesh>
                {/* Foot */}
                <mesh position={[-0.8, -0.05, 0.3]} rotation={[0, 0, 1.5]} castShadow>
                  <boxGeometry args={[0.1, 0.08, 0.15]} />
                  <meshStandardMaterial color="#2d3436" roughness={0.6} />
                </mesh>
              </group>

              {/* Left Leg */}
              <group position={[-0.3, 0.05, -0.1]}>
                {/* Thigh */}
                <mesh position={[-0.2, 0.05, -0.1]} rotation={[0.4, 0, 1.3]} castShadow>
                  <capsuleGeometry args={[0.08, 0.35, 8, 8]} />
                  <meshStandardMaterial color="#0984e3" roughness={0.8} />
                </mesh>
                {/* Calf */}
                <mesh position={[-0.55, 0, -0.25]} rotation={[0.2, 0, 1.5]} castShadow>
                  <capsuleGeometry args={[0.07, 0.35, 8, 8]} />
                  <meshStandardMaterial color="#0984e3" roughness={0.8} />
                </mesh>
                {/* Foot */}
                <mesh position={[-0.8, -0.05, -0.3]} rotation={[0, 0, 1.5]} castShadow>
                  <boxGeometry args={[0.1, 0.08, 0.15]} />
                  <meshStandardMaterial color="#2d3436" roughness={0.6} />
                </mesh>
              </group>
            </group>

            {/* Blood Spatter around body */}
            <group rotation={[-Math.PI / 2, 0, 0]} position={[0.4, -0.045, 0.2]}>
               <mesh>
                 <circleGeometry args={[0.6, 32]} />
                 <meshStandardMaterial color="#4a0000" transparent opacity={0.6} roughness={0.1} depthWrite={false} />
               </mesh>
               <mesh position={[0.4, 0.3, 0]}>
                 <circleGeometry args={[0.3, 16]} />
                 <meshStandardMaterial color="#3a0000" transparent opacity={0.5} roughness={0.1} depthWrite={false} />
               </mesh>
               <mesh position={[-0.2, 0.5, 0]}>
                 <circleGeometry args={[0.2, 16]} />
                 <meshStandardMaterial color="#4a0000" transparent opacity={0.4} roughness={0.1} depthWrite={false} />
               </mesh>
            </group>
          </group>
        )}
          {item.type === 'glass' && (
            <group>
              {[...Array(12)].map((_, i) => (
                <mesh 
                  key={i} 
                  position={[Math.random() * 0.6 - 0.3, -0.045, Math.random() * 0.6 - 0.3]} 
                  rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
                  castShadow
                >
                  <boxGeometry args={[Math.random() * 0.1 + 0.02, 0.01, Math.random() * 0.1 + 0.02]} />
                  <meshPhysicalMaterial 
                    color="#ffffff" 
                    transparent 
                    opacity={0.8} 
                    transmission={1} 
                    thickness={0.2} 
                    roughness={0} 
                  />
                </mesh>
              ))}
            </group>
          )}
          {item.type === 'generic' && (
             <mesh position={[0, 0.1, 0]} castShadow>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#00f0ff" metalness={0.5} roughness={0.2} emissive="#00f0ff" emissiveIntensity={0.2} />
            </mesh>
          )}
        </group>
        );
      })}
    </>
  );
}

export function CrimeSceneViewer({ evidence, className }: CrimeSceneViewerProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [flashlightMode, setFlashlightMode] = useState(false);
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(new Set());
  const [cameraView, setCameraView] = useState('isometric');
  const [panDelta, setPanDelta] = useState({x: 0, y: 0});
  const [zoomDelta, setZoomDelta] = useState(0);

  const handleDiscover = (item: Evidence) => {
    setDiscoveredIds(prev => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
    setSelectedEvidence(item);
  };

  const handleSetView = (view: string) => {
    setSelectedEvidence(null);
    setCameraView(view);
  };

  const handlePan = (dx: number, dy: number) => {
    setCameraView('free');
    setSelectedEvidence(null);
    setPanDelta({x: dx, y: dy});
  };

  const handleZoom = (dz: number) => {
    setCameraView('free');
    setSelectedEvidence(null);
    setZoomDelta(dz);
  };

  const handleStopNavigation = () => {
    setPanDelta({x: 0, y: 0});
    setZoomDelta(0);
  };

  useEffect(() => {
     window.addEventListener('mouseup', handleStopNavigation);
     window.addEventListener('touchend', handleStopNavigation);
     return () => {
        window.removeEventListener('mouseup', handleStopNavigation);
        window.removeEventListener('touchend', handleStopNavigation);
     }
  }, []);

  return (
    <div className={`relative bg-[#f8f9fa] rounded-none border border-black/5 overflow-hidden shadow-inner ${className || "h-[500px]"}`}>
      <Canvas 
        camera={{ position: [8, 6, 8], fov: 35 }} 
        shadows 
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={["#0a0b10"]} />
        <fog attach="fog" args={["#0a0b10", 10, 30]} />
        
        <ambientLight intensity={flashlightMode ? 0.05 : 0.2} color="#ffffff" />
        
        {!flashlightMode && (
          <spotLight
            position={[0, 10, 0]}
            angle={0.6}
            penumbra={0.5}
            intensity={4}
            distance={25}
            castShadow
            color="#ffffff"
            shadow-mapSize={[1024, 1024]}
          />
        )}

        {flashlightMode ? (
          <>
            <FlashlightLight />
            <pointLight position={[5, 4, -5]} intensity={0.5} color="#00f0ff" />
            <pointLight position={[-5, 4, 5]} intensity={0.2} color="#e1b12c" />
          </>
        ) : (
          <>
            <pointLight position={[5, 4, -5]} intensity={2} color="#00f0ff" />
            <pointLight position={[-5, 4, 5]} intensity={1} color="#e1b12c" />
          </>
        )}
        
        <group>
          <Room />
          <EvidenceObjects evidence={evidence} />
          
          {Array.isArray(evidence) && evidence.map((item, idx) => (
            <Marker 
              key={`${item.id}-${idx}`} 
              item={item} 
              onSelect={setSelectedEvidence} 
              isSelected={selectedEvidence?.id === item.id}
              isDiscovered={discoveredIds.has(item.id)}
              onDiscover={() => handleDiscover(item)}
              flashlightMode={flashlightMode}
            />
          ))}

          {/* Atmospheric Dust Particles */}
          <Sparkles count={50} scale={10} size={1} speed={0.4} opacity={0.3} color="#00f0ff" />
          <Sparkles count={30} scale={10} size={2} speed={0.2} opacity={0.1} color="#ffffff" />
        </group>

        <CameraHandler 
          selectedEvidence={selectedEvidence} 
          cameraView={cameraView}
          panDelta={panDelta}
          zoomDelta={zoomDelta}
        />


        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={2} 
          maxDistance={15}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2} 
          makeDefault 
          screenSpacePanning={true}
          dampingFactor={0.05}
          enableDamping={true}
        />
        <Environment preset="studio" />
        <ContactShadows position={[0, -0.05, 0]} opacity={0.3} scale={20} blur={2.5} far={5} color="#000000" />
        
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.5} radius={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={0.3} />
          <Noise opacity={0.02} />
        </EffectComposer>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-start gap-2">
        <div className="bg-black/5 dark:bg-white/80 backdrop-blur-md p-3 border border-black/5 rounded-lg shadow-xl">
          <h4 className="text-crust font-heading font-bold text-sm mb-1 uppercase tracking-widest">Active Scene</h4>
          <p className="text-text-muted text-[10px] uppercase font-bold tracking-tighter">Clinical Environment Active</p>
        </div>
        
        <button 
          onClick={() => setFlashlightMode(!flashlightMode)}
          className={`p-3 backdrop-blur-md rounded-xl border transition-all flex items-center justify-center ${flashlightMode ? 'bg-warning text-crust border-warning shadow-[0_0_15px_rgba(255,191,0,0.4)]' : 'bg-base/80 border-black/10 dark:border-white/10 hover:border-black/10 dark:border-white/30 text-text-main'}`}
          title="Toggle Flashlight / Discovery Mode"
        >
          <Flashlight size={18} />
        </button>
      </div>

      {/* Camera Controls Overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
         {/* Pan controls */}
         <div className="grid grid-cols-3 gap-1 bg-surface/80 backdrop-blur-md p-2 border border-black/10 dark:border-white/10 rounded-xl shadow-xl w-fit">
            <div />
            <button onPointerDown={() => handlePan(0, 1)} className="p-2 backdrop-blur-md rounded-lg border border-black/10 dark:border-white/5 bg-base hover:bg-black/5 dark:bg-white/10 hover:border-black/10 dark:border-white/20 text-text-muted transition-all flex items-center justify-center pointer-events-auto">
               <ChevronUp size={16} />
            </button>
            <div />
            <button onPointerDown={() => handlePan(1, 0)} className="p-2 backdrop-blur-md rounded-lg border border-black/10 dark:border-white/5 bg-base hover:bg-black/5 dark:bg-white/10 hover:border-black/10 dark:border-white/20 text-text-muted transition-all flex items-center justify-center pointer-events-auto">
               <ChevronLeft size={16} />
            </button>
            <button onClick={() => handleSetView('isometric')} className="p-2 backdrop-blur-md rounded-lg border border-warning/20 bg-warning/10 hover:bg-warning/20 text-warning transition-all flex items-center justify-center pointer-events-auto shadow-[0_0_10px_rgba(255,191,0,0.1)]">
               <Box size={16} />
            </button>
            <button onPointerDown={() => handlePan(-1, 0)} className="p-2 backdrop-blur-md rounded-lg border border-black/10 dark:border-white/5 bg-base hover:bg-black/5 dark:bg-white/10 hover:border-black/10 dark:border-white/20 text-text-muted transition-all flex items-center justify-center pointer-events-auto">
               <ChevronRight size={16} />
            </button>
            <div />
            <button onPointerDown={() => handlePan(0, -1)} className="p-2 backdrop-blur-md rounded-lg border border-black/10 dark:border-white/5 bg-base hover:bg-black/5 dark:bg-white/10 hover:border-black/10 dark:border-white/20 text-text-muted transition-all flex items-center justify-center pointer-events-auto">
               <ChevronDown size={16} />
            </button>
            <div />
         </div>
         {/* Presets and Zoom */}
         <div className="flex gap-2">
            <div className="flex gap-1 bg-surface/80 backdrop-blur-md p-2 border border-black/10 dark:border-white/10 rounded-xl shadow-xl w-fit">
               <button onClick={() => handleSetView('top')} className={`p-2 backdrop-blur-md rounded-lg border transition-all flex items-center justify-center pointer-events-auto ${cameraView === 'top' ? 'bg-primary/20 border-primary text-primary' : 'border-black/10 dark:border-white/5 bg-base hover:bg-black/5 dark:bg-white/10 hover:border-black/10 dark:border-white/20 text-text-muted'}`} title="Top View">
                  <Square size={16} />
               </button>
               <button onClick={() => handleSetView('front')} className={`p-2 backdrop-blur-md rounded-lg border transition-all flex items-center justify-center pointer-events-auto ${cameraView === 'front' ? 'bg-primary/20 border-primary text-primary' : 'border-black/10 dark:border-white/5 bg-base hover:bg-black/5 dark:bg-white/10 hover:border-black/10 dark:border-white/20 text-text-muted'}`} title="Front View">
                  <Monitor size={16} />
               </button>
            </div>
            <div className="flex gap-1 bg-surface/80 backdrop-blur-md p-2 border border-black/10 dark:border-white/10 rounded-xl shadow-xl w-fit">
               <button onPointerDown={() => handleZoom(-1)} className="p-2 backdrop-blur-md rounded-lg border border-black/10 dark:border-white/5 bg-base hover:bg-black/5 dark:bg-white/10 hover:border-black/10 dark:border-white/20 text-text-muted transition-all flex items-center justify-center pointer-events-auto">
                  <ZoomIn size={16} />
               </button>
               <button onPointerDown={() => handleZoom(1)} className="p-2 backdrop-blur-md rounded-lg border border-black/10 dark:border-white/5 bg-base hover:bg-black/5 dark:bg-white/10 hover:border-black/10 dark:border-white/20 text-text-muted transition-all flex items-center justify-center pointer-events-auto">
                  <ZoomOut size={16} />
               </button>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {selectedEvidence && (
          <motion.div 
            initial={{ y: 300, x: 0, opacity: 0 }}
            animate={{ 
              y: 0, 
              x: 0,
              opacity: 1 
            }}
            exit={{ y: 300, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 sm:top-0 sm:left-auto sm:right-0 sm:h-full w-full sm:w-80 bg-surface/95 backdrop-blur-2xl border-t sm:border-t-0 sm:border-l border-warning/30 p-6 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col rounded-t-3xl sm:rounded-none"
          >
            <div className="w-12 h-1.5 bg-black/5 dark:bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />
            
            <button 
              onClick={() => setSelectedEvidence(null)}
              className="absolute top-4 right-4 p-2 bg-base rounded-full text-text-muted hover:text-warning"
            >
              <Info size={18} />
            </button>
            
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning border border-warning/30">
                   <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-black text-warning leading-none mb-1">{selectedEvidence.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Evidence Item</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-crust/50 p-4 border border-black/10 dark:border-white/5 rounded-lg">
                  <h5 className="text-[10px] uppercase font-bold tracking-widest text-warning mb-2">Forensic Findings</h5>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {selectedEvidence.finding}
                  </p>
                </div>
                
                <div className="text-[10px] font-mono text-text-muted opacity-50 uppercase tracking-tighter">
                  Location: {Array.isArray(selectedEvidence.position) ? selectedEvidence.position.map(p => Number(p || 0).toFixed(2)).join(', ') : 'Unknown'}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedEvidence(null)}
              className="mt-auto w-full py-3 border border-warning/30 text-warning font-bold uppercase tracking-widest text-xs hover:bg-warning/10 transition-colors"
            >
              Back to Scene
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
