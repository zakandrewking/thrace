import { useMemo, useRef } from 'react';

import * as THREE from 'three';
import {
  CylinderGeometry,
  DoubleSide,
  Mesh,
  TextureLoader,
} from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

import { useFrame, useLoader } from '@react-three/fiber';

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//  CONFIGURATION CONSTANTS
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const VENT_BASE_RADIUS = 1.5;
const VENT_TOP_RADIUS = 0.8;
const VENT_HEIGHT = 6;
const VENT_SEGMENTS = 64; // More radial segments for smoother geometry
const CHIMNEY_HEIGHT_FACTOR = 0.3; // 30% of the total height is chimney
const CHIMNEY_RADIUS_FACTOR = 0.6; // Chimney radius is 60% of top radius

// Rock surface texture assets (replace with your own texture set)
const ROCK_DIFF_MAP = "/textures/vent/dry_riverbed_rock_diff_1k.jpg";
const ROCK_DISP_MAP = "/textures/vent/dry_riverbed_rock_disp_1k.png";
const ROCK_NOR_MAP = "/textures/vent/dry_riverbed_rock_nor_gl_1k.exr";
const ROCK_ROUGH_MAP = "/textures/vent/dry_riverbed_rock_rough_1k.exr";

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//  VENT PLUME — semi‑transparent particle cylinder that shimmers
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function VentPlume({ height = 3, baseRadius = 0.7 }) {
  const plumeRef = useRef<Mesh>(null!);

  // Simple breathing animation on opacity + scale
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (plumeRef.current) {
      (plumeRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.28 + Math.sin(t * 1.8) * 0.06;
      plumeRef.current.scale.setScalar(1 + Math.sin(t * 0.9) * 0.04);
    }
  });

  return (
    <mesh ref={plumeRef} position={[0, height * 0.5, 0]} rotation={[0, 0, 0]}>
      <cylinderGeometry
        args={[baseRadius * 1.4, baseRadius, height, 32, 8, true]}
      />
      <meshStandardMaterial
        transparent
        depthWrite={false}
        side={DoubleSide}
        opacity={0.3}
        color={"#8fa7b3"}
        emissive={"#1e293b"}
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//  MAIN HYDROTHERMAL VENT COMPONENT
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export default function HydrothermalVent() {
  const mainHeight = VENT_HEIGHT * (1 - CHIMNEY_HEIGHT_FACTOR);
  const chimneyHeight = VENT_HEIGHT * CHIMNEY_HEIGHT_FACTOR;
  const chimneyRadius = VENT_TOP_RADIUS * CHIMNEY_RADIUS_FACTOR;

  // Load non-EXR textures
  const [colorMap, displacementMap] = useLoader(TextureLoader, [
    ROCK_DIFF_MAP,
    ROCK_DISP_MAP,
  ]);
  // Load EXR textures separately
  const [normalMap, roughnessMap] = useLoader(EXRLoader, [
    ROCK_NOR_MAP,
    ROCK_ROUGH_MAP,
  ]);

  // Memoize geometry with higher segment count for smooth displacement
  const [mainGeo, chimneyGeo] = useMemo(() => {
    const gMain = new CylinderGeometry(
      VENT_BASE_RADIUS,
      VENT_TOP_RADIUS,
      mainHeight,
      VENT_SEGMENTS,
      32,
      true
    );
    const gChimney = new CylinderGeometry(
      chimneyRadius,
      VENT_TOP_RADIUS,
      chimneyHeight,
      VENT_SEGMENTS,
      20,
      true
    );

    // Roughen silhouette by randomising rim vertices a bit (pseudo‑erosion)
    const jitterRim = (geo: CylinderGeometry) => {
      const posAttr = geo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const y = posAttr.getY(i);
        if (Math.abs(Math.abs(y) - geo.parameters.height / 2) < 0.01) {
          const dx = (Math.random() - 0.5) * 0.05;
          const dz = (Math.random() - 0.5) * 0.05;
          posAttr.setX(i, posAttr.getX(i) + dx);
          posAttr.setZ(i, posAttr.getZ(i) + dz);
        }
      }
      posAttr.needsUpdate = true;
    };

    jitterRim(gMain);
    jitterRim(gChimney);

    return [gMain, gChimney];
  }, [mainHeight, chimneyHeight]);

  return (
    <group position={[0, -VENT_HEIGHT / 2, -3]}>
      {/* Main Vent Body */}
      <mesh
        geometry={mainGeo}
        position={[0, -chimneyHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          displacementMap={displacementMap}
          displacementScale={0.15}
          roughness={1}
          metalness={0.05}
        />
      </mesh>

      {/* Chimney Top */}
      <mesh
        geometry={chimneyGeo}
        position={[0, mainHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          displacementMap={displacementMap}
          displacementScale={0.2}
          roughness={0.9}
          metalness={0.08}
        />
      </mesh>

      {/* Scalding mineral‑rich plume */}
      <VentPlume height={4} baseRadius={chimneyRadius} />
    </group>
  );
}
