import { useRef } from 'react';

import * as THREE from 'three';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

// Component for the rotating sphere
function Sphere() {
  // Ref to access the mesh object
  const meshRef = useRef<THREE.Mesh>(null!);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 18, 18]} />
      <meshBasicMaterial color={0x0077ff} wireframe={true} />
    </mesh>
  );
}

export default function Step0() {
  return (
    <div style={{ width: "500px", height: "500px", border: "1px solid grey" }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        {" "}
        {/* Set initial camera position */}
        {/* Ambient light affects all objects in the scene globally */}
        <ambientLight intensity={0.5} />
        {/* Directional light comes from a specific direction */}
        <directionalLight position={[2, 2, 5]} intensity={1} />
        <Sphere />
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
