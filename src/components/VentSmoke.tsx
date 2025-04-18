import { useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

interface VentSmokeProps {
  count?: number;
  color?: THREE.ColorRepresentation;
  size?: number;
  ventTopPosition?: [number, number, number]; // Position of the chimney top
  emissionRadius?: number; // Radius of the emission area
  speed?: number; // Upward speed
  spreadFactor?: number; // How much it spreads horizontally
  maxHeight?: number; // How high particles go before resetting
}

export default function VentSmoke({
  count = 200,
  color = "#cccccc", // Light grey/white smoke
  size = 0.08,
  ventTopPosition = [0, 0, -3], // Default: Top of vent (0, height/2, -3)
  emissionRadius = 0.5, // Emit from a smaller radius
  speed = 0.8,
  spreadFactor = 0.2,
  maxHeight = 8, // Max height relative to vent top
}: VentSmokeProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  // Create position attribute imperatively
  const positionAttribute = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Start particles randomly within emission radius and slightly above vent top
      const r = emissionRadius * Math.random(); // Uniform radius distribution
      const theta = Math.random() * Math.PI * 2;
      const initialY = Math.random() * 0.5; // Start slightly above the vent top

      positions[i3] = ventTopPosition[0] + r * Math.cos(theta);
      positions[i3 + 1] = ventTopPosition[1] + initialY;
      positions[i3 + 2] = ventTopPosition[2] + r * Math.sin(theta);
    }
    const attribute = new THREE.BufferAttribute(positions, 3);
    attribute.setUsage(THREE.DynamicDrawUsage);
    return attribute;
  }, [count, emissionRadius, ventTopPosition]);

  // Store base positions to calculate relative movement
  const basePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = emissionRadius * Math.random();
      const theta = Math.random() * Math.PI * 2;
      positions[i3] = ventTopPosition[0] + r * Math.cos(theta);
      positions[i3 + 1] = ventTopPosition[1] + Math.random() * 0.5;
      positions[i3 + 2] = ventTopPosition[2] + r * Math.sin(theta);
    }
    return positions;
  }, [count, emissionRadius, ventTopPosition]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const elapsedTime = clock.getElapsedTime();
    const currentPositions = positionAttribute.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const baseX = basePositions[i3];
      const baseZ = basePositions[i3 + 2];

      const travelDistance = (elapsedTime * speed * 0.5) % maxHeight;
      let currentY = ventTopPosition[1] + travelDistance;

      const heightFactor = travelDistance / maxHeight;
      const currentSpread =
        emissionRadius + heightFactor * spreadFactor * maxHeight * 0.5;

      const baseDist = Math.sqrt(
        (baseX - ventTopPosition[0]) ** 2 + (baseZ - ventTopPosition[2]) ** 2
      );
      const spreadRatio =
        baseDist > 0 && emissionRadius > 0 ? currentSpread / emissionRadius : 1; // Avoid division by zero

      let currentX =
        ventTopPosition[0] + (baseX - ventTopPosition[0]) * spreadRatio;
      let currentZ =
        ventTopPosition[2] + (baseZ - ventTopPosition[2]) * spreadRatio;

      // Add some minor turbulence/randomness
      currentX += (Math.random() - 0.5) * 0.05 * heightFactor;
      currentY += (Math.random() - 0.5) * 0.05 * heightFactor;
      currentZ += (Math.random() - 0.5) * 0.05 * heightFactor;

      currentPositions[i3] = currentX;
      currentPositions[i3 + 1] = currentY;
      currentPositions[i3 + 2] = currentZ;
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
        sizeAttenuation={true}
        transparent={true}
        opacity={0.4} // Smokier opacity
        depthWrite={false} // Prevent particles blocking each other unnaturally
      />
    </points>
  );
}
