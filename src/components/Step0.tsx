import { useCallback, useRef } from 'react';

import * as THREE from 'three';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';

import ZoomControls from './ZoomControls';

// Component for the rotating sphere
function Sphere() {
  // Ref to access the mesh object
  const meshRef = useRef<THREE.Mesh>(null!);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color={0x0077ff} wireframe={true} />
    </mesh>
  );
}

// Helper component to access camera and set up zoom functions
interface CameraSetupProps {
  setZoomIn: (fn: () => void) => void;
  setZoomOut: (fn: () => void) => void;
}

function CameraSetup({ setZoomIn, setZoomOut }: CameraSetupProps) {
  const { camera } = useThree();
  const zoomFactor = 0.5;

  // Define zoom functions using useCallback to ensure stable references
  const zoomIn = useCallback(() => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    camera.position.addScaledVector(direction, zoomFactor);
    camera.updateProjectionMatrix();
  }, [camera]); // Recreate if camera instance changes

  const zoomOut = useCallback(() => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    camera.position.addScaledVector(direction, -zoomFactor);
    camera.updateProjectionMatrix();
  }, [camera]);

  // Pass the functions up to the parent using the setters
  setZoomIn(zoomIn);
  setZoomOut(zoomOut);

  return null; // This component doesn't render anything itself
}

export default function Step0() {
  // Refs to hold the zoom functions
  const zoomInRef = useRef<() => void>(() => {});
  const zoomOutRef = useRef<() => void>(() => {});

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <ZoomControls
        onZoomIn={() => zoomInRef.current()}
        onZoomOut={() => zoomOutRef.current()}
      />
      <Canvas camera={{ position: [0, 0, 3] }}>
        {" "}
        {/* Set initial camera position */}
        {/* Ambient light affects all objects in the scene globally */}
        <ambientLight intensity={0.5} />
        {/* Directional light comes from a specific direction */}
        <directionalLight position={[2, 2, 5]} intensity={1} />
        <Sphere />
        <OrbitControls enableZoom={true} />
        <CameraSetup
          setZoomIn={(fn) => {
            zoomInRef.current = fn;
          }}
          setZoomOut={(fn) => {
            zoomOutRef.current = fn;
          }}
        />
      </Canvas>
    </div>
  );
}
