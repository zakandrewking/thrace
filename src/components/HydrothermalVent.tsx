import React from 'react';

export default function HydrothermalVent() {
  return (
    <mesh position={[0, -5, -3]} rotation={[0, 0, 0]}>
      {" "}
      {/* Position below center */}
      <coneGeometry args={[1.5, 6, 16]} /> {/* Base radius, height, segments */}
      <meshStandardMaterial color="#3d3d3d" roughness={0.8} metalness={0.2} />
    </mesh>
  );
}
