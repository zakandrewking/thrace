import { useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

interface FuelMoleculesProps {
  count?: number;
  size?: number;
  color?: THREE.ColorRepresentation;
  areaRadius?: number;
  speed?: number;
}

export default function FuelMolecules({
  count = 50, // Fewer fuel molecules
  size = 0.08, // Slightly larger?
  color = "#00ff00", // Green color
  areaRadius = 7.0, // Use same radius as particles for now
  speed = 0.6, // Maybe slightly different speed
}: FuelMoleculesProps) {
  const pointsRef = useRef<THREE.InstancedMesh>(null!); // Use InstancedMesh for potentially different shapes

  // Base positions (same logic as FloatingParticles)
  const basePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    // ... (same random sphere distribution logic as FloatingParticles)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = areaRadius * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [count, areaRadius]);

  // Dummy object for InstancedMesh matrix updates
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const elapsedTime = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Calculate current offsets (similar logic, using `speed` prop)
      const currentVerticalOffset =
        Math.sin(elapsedTime * 0.05 * speed + i * 0.5) * 0.1;
      const currentHorizontalOffsetX =
        Math.sin(elapsedTime * 0.08 * speed + i * 0.6) * 0.075;
      const currentHorizontalOffsetZ =
        Math.cos(elapsedTime * 0.06 * speed + i * 0.7) * 0.075;

      // Apply current offsets to the base positions to get current position
      dummy.position.set(
        basePositions[i3] + currentHorizontalOffsetX,
        basePositions[i3 + 1] + currentVerticalOffset,
        basePositions[i3 + 2] + currentHorizontalOffsetZ
      );

      // Maybe add slight random rotation
      dummy.rotation.x = Math.sin(elapsedTime * 0.1 * speed + i) * 0.2;
      dummy.rotation.y = Math.cos(elapsedTime * 0.1 * speed + i) * 0.2;

      dummy.updateMatrix();
      pointsRef.current.setMatrixAt(i, dummy.matrix);
    }
    pointsRef.current.instanceMatrix.needsUpdate = true;
  });

  // Set initial positions (using the same logic as useFrame with small elapsedTime)
  useMemo(() => {
    if (!pointsRef.current) return;
    const initialElapsedTime = 0.01;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const initialVerticalOffset =
        Math.sin(initialElapsedTime * 0.05 * speed + i * 0.5) * 0.1;
      const initialHorizontalOffsetX =
        Math.sin(initialElapsedTime * 0.08 * speed + i * 0.6) * 0.075;
      const initialHorizontalOffsetZ =
        Math.cos(initialElapsedTime * 0.06 * speed + i * 0.7) * 0.075;
      dummy.position.set(
        basePositions[i3] + initialHorizontalOffsetX,
        basePositions[i3 + 1] + initialVerticalOffset,
        basePositions[i3 + 2] + initialHorizontalOffsetZ
      );
      dummy.updateMatrix();
      pointsRef.current.setMatrixAt(i, dummy.matrix);
    }
    pointsRef.current.instanceMatrix.needsUpdate = true;
  }, [count, basePositions, speed, dummy]); // Add dummy dependency

  return (
    // Use InstancedMesh to draw multiple copies of one geometry efficiently
    <instancedMesh ref={pointsRef} args={[undefined, undefined, count]}>
      {/* Simple Box Geometry for fuel */}
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
    </instancedMesh>
  );
}
