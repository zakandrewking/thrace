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
import H2SMolecules from './H2S_Molecules';
import HydrothermalVent from './HydrothermalVent';
import SimulationControls from './SimulationControls';

// Constants for parameters (instead of state)
const SPHERE_BOBBING_SPEED = 0.3;
const PARTICLE_SPEED = 0.8;
const PARTICLE_DISTRIBUTION_RADIUS = 7.0;
const MIN_CAMERA_ZOOM_DISTANCE = 1.5; // Keeping zoom limits constant
const MAX_CAMERA_ZOOM_DISTANCE = 10.0;
const H2S_SPEED_FACTOR = 0.5; // Relative speed of H2S vs environment particles
const VENT_POSITION: [number, number, number] = [0, -5, -3]; // Define vent position once

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
  // State for simulation stage
  const [currentStage, setCurrentStage] = useState(0);

  // Refs for zoom functions
  const zoomInRef = useRef<() => void>(() => {});
  const zoomOutRef = useRef<() => void>(() => {});

  // Determine element visibility based on stage
  const showVent = currentStage >= 1;
  const showH2S = currentStage >= 2;
  const showCellBoundary = currentStage >= 3; // Boundary appears at stage 3

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
        currentStage={currentStage}
        setCurrentStage={setCurrentStage}
        onZoomIn={() => zoomInRef.current()}
        onZoomOut={() => zoomOutRef.current()}
      />
      <Canvas
        camera={{ position: [0, 0, 5] }}
        scene={{ background: new THREE.Color("#1a2b47") }}
      >
        <ambientLight intensity={currentStage > 0 ? 0.5 : 0.2} />
        <directionalLight
          position={[2, 2, 5]}
          intensity={currentStage > 0 ? 1 : 0.3}
        />
        <Sphere
          bobbingSpeed={SPHERE_BOBBING_SPEED}
          showBoundary={showCellBoundary}
        />
        <FloatingParticles
          particleSpeed={PARTICLE_SPEED}
          areaRadius={PARTICLE_DISTRIBUTION_RADIUS}
        />
        {showVent && <HydrothermalVent />}
        {showH2S && (
          <H2SMolecules
            speed={PARTICLE_SPEED * H2S_SPEED_FACTOR}
            emissionRadius={PARTICLE_DISTRIBUTION_RADIUS * 0.3}
            ventPosition={VENT_POSITION}
          />
        )}
        <OrbitControls
          enableZoom={true}
          minDistance={MIN_CAMERA_ZOOM_DISTANCE}
          maxDistance={MAX_CAMERA_ZOOM_DISTANCE}
          target={[0, 0, 0]}
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
