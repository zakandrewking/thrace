import React, {
  useMemo,
  useRef,
} from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

interface FloatingParticlesProps {
  count?: number;
  size?: number;
  color?: THREE.ColorRepresentation;
  areaRadius?: number; // Radius of the sphere within which particles float
  particleSpeed?: number; // Add speed prop
}

export default function FloatingParticles({
  count = 150,
  size = 0.1,
  color = "#000000",
  areaRadius = 2.5, // Reduced radius to keep particles closer
  particleSpeed = 1.0, // Default speed multiplier
}: FloatingParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  // Store base positions separately for animation reference
  const basePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
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

  // Create the attribute with initial offsets applied
  const positionAttribute = useMemo(() => {
    const startingPositions = new Float32Array(count * 3);
    const initialElapsedTime = 0.01; // Small time offset for initial calculation

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const base_x = basePositions[i3];
      const base_y = basePositions[i3 + 1];
      const base_z = basePositions[i3 + 2];

      // Calculate initial offsets
      const initialVerticalOffset =
        Math.sin(initialElapsedTime * 0.05 * particleSpeed + i * 0.5) * 0.02;
      const initialHorizontalOffsetX =
        Math.sin(initialElapsedTime * 0.08 * particleSpeed + i * 0.6) * 0.015;
      const initialHorizontalOffsetZ =
        Math.cos(initialElapsedTime * 0.06 * particleSpeed + i * 0.7) * 0.015;

      // Apply initial offsets to base positions
      startingPositions[i3] = base_x + initialHorizontalOffsetX;
      startingPositions[i3 + 1] = base_y + initialVerticalOffset;
      startingPositions[i3 + 2] = base_z + initialHorizontalOffsetZ;
    }
    const attribute = new THREE.BufferAttribute(startingPositions, 3);
    attribute.setUsage(THREE.DynamicDrawUsage);
    return attribute;
  }, [count, basePositions, particleSpeed]); // Depend on basePositions and particleSpeed

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const currentPositions = positionAttribute.array as Float32Array;
    // const initialPositions = initialPositionsRef.current; // We use basePositions now

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Increase amplitude slightly for more visible movement
      const currentVerticalOffset =
        Math.sin(elapsedTime * 0.05 * particleSpeed + i * 0.5) * 0.1; // Increased amplitude
      const currentHorizontalOffsetX =
        Math.sin(elapsedTime * 0.08 * particleSpeed + i * 0.6) * 0.075; // Increased amplitude
      const currentHorizontalOffsetZ =
        Math.cos(elapsedTime * 0.06 * particleSpeed + i * 0.7) * 0.075; // Increased amplitude

      // Apply current offsets to the base positions
      currentPositions[i3] = basePositions[i3] + currentHorizontalOffsetX;
      currentPositions[i3 + 1] = basePositions[i3 + 1] + currentVerticalOffset;
      currentPositions[i3 + 2] =
        basePositions[i3 + 2] + currentHorizontalOffsetZ;
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry">
        <primitive attach="attributes-position" object={positionAttribute} />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        size={size}
        color={color}
        sizeAttenuation={true} // Make particles smaller further away
        transparent={true}
        opacity={0.8}
      />
    </points>
  );
}
