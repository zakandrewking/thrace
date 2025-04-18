import {
  useCallback,
  useRef,
  useState,
} from 'react';

import * as THREE from 'three';

import { OrbitControls } from '@react-three/drei';
import {
  Canvas,
  useFrame,
  useThree,
} from '@react-three/fiber';

import FloatingParticles from './FloatingParticles';
import FuelMolecules from './FuelMolecules';
import SimulationControls from './SimulationControls';

// Constants for parameters (instead of state)
const SPHERE_BOBBING_SPEED = 0.3;
const PARTICLE_SPEED = 0.8;
const PARTICLE_DISTRIBUTION_RADIUS = 7.0;
const MIN_CAMERA_ZOOM_DISTANCE = 1.5; // Keeping zoom limits constant
const MAX_CAMERA_ZOOM_DISTANCE = 10.0;

// Component for the rotating sphere
interface SphereProps {
  bobbingSpeed: number;
  showBoundary: boolean;
}

function Sphere({ bobbingSpeed, showBoundary }: SphereProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(clock.getElapsedTime() * bobbingSpeed) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={0x0077ff} wireframe={true} />
      </mesh>

      {showBoundary && (
        <mesh>
          <sphereGeometry args={[1.1, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.2}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
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
    const potentialPosition = camera.position
      .clone()
      .addScaledVector(direction, zoomFactor);
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
  // State only for simulation steps
  const [showBoundary, setShowBoundary] = useState(false);
  const [showFuel, setShowFuel] = useState(false);

  // Refs for zoom functions still needed for CameraSetup
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
      <SimulationControls
        showBoundary={showBoundary}
        setShowBoundary={setShowBoundary}
        showFuel={showFuel}
        setShowFuel={setShowFuel}
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
        <Sphere
          bobbingSpeed={SPHERE_BOBBING_SPEED}
          showBoundary={showBoundary}
        />
        <FloatingParticles
          particleSpeed={PARTICLE_SPEED}
          areaRadius={PARTICLE_DISTRIBUTION_RADIUS}
        />
        {showFuel && (
          <FuelMolecules
            speed={PARTICLE_SPEED * 0.8}
            areaRadius={PARTICLE_DISTRIBUTION_RADIUS}
          />
        )}
        <OrbitControls
          enableZoom={true}
          minDistance={MIN_CAMERA_ZOOM_DISTANCE}
          maxDistance={MAX_CAMERA_ZOOM_DISTANCE}
        />
        <CameraSetup
          setZoomIn={(fn) => {
            zoomInRef.current = fn;
          }}
          setZoomOut={(fn) => {
            zoomOutRef.current = fn;
          }}
          minDistance={MIN_CAMERA_ZOOM_DISTANCE}
        />
      </Canvas>
    </div>
  );
}
