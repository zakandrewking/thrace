import { useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

interface H2SMoleculesProps {
  count?: number;
  size?: number;
  color?: THREE.ColorRepresentation;
  ventPosition?: [number, number, number]; // Position of the vent source
  emissionRadius?: number; // How far from the vent top they spread initially
  speed?: number;
}

export default function H2SMolecules({
  count = 80,
  size = 0.06,
  color = "#FFFF99", // Pale yellow
  ventPosition = [0, -2, -3], // Approx top of vent [0, -5+6/2, -3] -> [0, -2, -3]
  emissionRadius = 1.5,
  speed = 0.5,
}: H2SMoleculesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!); // Corrected ref name
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Base positions: Start near the top of the vent
  const basePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Random point within a smaller sphere around the vent top
      const r = emissionRadius * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = ventPosition[0] + r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = ventPosition[1] + r * Math.sin(phi) * Math.sin(theta); // More vertical spread initially?
      positions[i3 + 2] = ventPosition[2] + r * Math.cos(phi);
    }
    return positions;
  }, [count, emissionRadius, ventPosition]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const elapsedTime = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Upward and outward drift from base, slower than particulates
      const upwardDrift = (elapsedTime * 0.1 * speed) % (emissionRadius * 4); // Loop drift over larger vertical distance
      const outwardDriftFactor = 1 + elapsedTime * 0.05 * speed;

      const currentX =
        (basePositions[i3] - ventPosition[0]) * outwardDriftFactor +
        ventPosition[0];
      const currentY = basePositions[i3 + 1] + upwardDrift;
      const currentZ =
        (basePositions[i3 + 2] - ventPosition[2]) * outwardDriftFactor +
        ventPosition[2];

      dummy.position.set(currentX, currentY, currentZ);
      // Optional: Add rotation?
      // dummy.rotation.x = Math.sin(elapsedTime * 0.1 * speed + i) * 0.2;
      // dummy.rotation.y = Math.cos(elapsedTime * 0.1 * speed + i) * 0.2;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Initial positioning (simplified, starts near vent)
  useMemo(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        basePositions[i * 3],
        basePositions[i * 3 + 1],
        basePositions[i * 3 + 2]
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [basePositions, dummy]); // Only depends on base positions

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Using simple spheres for H2S representation */}
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
    </instancedMesh>
  );
}
