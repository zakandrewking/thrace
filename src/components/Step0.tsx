import { useCallback, useRef } from 'react';

import * as THREE from 'three';

import { OrbitControls } from '@react-three/drei';
import {
  Canvas,
  useFrame,
  useThree,
} from '@react-three/fiber';

import FloatingParticles from './FloatingParticles';
import ZoomControls from './ZoomControls';

// --- Configuration Constants ---
const SPHERE_BOBBING_SPEED = 1;
const PARTICLE_SPEED = 8;
const PARTICLE_DISTRIBUTION_RADIUS = 10;
const MIN_CAMERA_ZOOM_DISTANCE = 1;
const MAX_CAMERA_ZOOM_DISTANCE = 5;
// -----------------------------

// Component for the rotating sphere
interface SphereProps {
  bobbingSpeed: number;
}

function Sphere({ bobbingSpeed }: SphereProps) {
  // Ref to access the mesh object
  const meshRef = useRef<THREE.Mesh>(null!);

  // Add useFrame for subtle bobbing
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Use bobbingSpeed prop
      meshRef.current.position.y =
        Math.sin(clock.getElapsedTime() * bobbingSpeed) * 0.05;
    }
  });

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
  minDistance: number;
}

function CameraSetup({ setZoomIn, setZoomOut, minDistance }: CameraSetupProps) {
  const { camera } = useThree();
  const zoomFactor = 1;

  const zoomIn = useCallback(() => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    // Calculate potential new position
    const potentialPosition = camera.position
      .clone()
      .addScaledVector(direction, zoomFactor);
    // Check distance from origin (assuming target is origin)
    if (potentialPosition.length() >= minDistance) {
      camera.position.copy(potentialPosition);
      camera.updateProjectionMatrix();
    }
  }, [camera, minDistance]);

  const zoomOut = useCallback(() => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const potentialPosition = camera.position
      .clone()
      .addScaledVector(direction, -zoomFactor);
    if (potentialPosition.length() >= minDistance) {
      camera.position.copy(potentialPosition);
      camera.updateProjectionMatrix();
    }
  }, [camera, minDistance]);

  setZoomIn(zoomIn);
  setZoomOut(zoomOut);

  return null;
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
      <Canvas
        camera={{ position: [0, 0, 3] }}
        scene={{ background: new THREE.Color("#87CEEB") }}
      >
        {" "}
        {/* Ambient light affects all objects in the scene globally */}
        <ambientLight intensity={0.5} />
        {/* Directional light comes from a specific direction */}
        <directionalLight position={[2, 2, 5]} intensity={1} />
        <Sphere bobbingSpeed={SPHERE_BOBBING_SPEED} />
        <FloatingParticles
          particleSpeed={PARTICLE_SPEED}
          areaRadius={PARTICLE_DISTRIBUTION_RADIUS}
        />
        <OrbitControls
          enableZoom={true}
          minDistance={MIN_CAMERA_ZOOM_DISTANCE} // Configure min zoom
          maxDistance={MAX_CAMERA_ZOOM_DISTANCE} // Configure max zoom
        />
        <CameraSetup
          setZoomIn={(fn) => {
            zoomInRef.current = fn;
          }}
          setZoomOut={(fn) => {
            zoomOutRef.current = fn;
          }}
          minDistance={MIN_CAMERA_ZOOM_DISTANCE} // Pass min distance down
        />
      </Canvas>
    </div>
  );
}
