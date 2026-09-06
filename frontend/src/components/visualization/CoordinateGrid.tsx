import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import * as THREE from 'three';

/**
 * 3D Ocean Domain Bounding Box and Coordinate Grid Frame.
 * Scaled:
 * X: Longitude (58°E to 98°E) -> mapped to [-10, 10]
 * Y: Depth (0m to -5000m) -> mapped to [0, -6] * verticalExaggeration
 * Z: Latitude (4°N to 26°N) -> mapped to [-6, 6]
 */
export const CoordinateGrid: React.FC = () => {
  const { showGrid, verticalExaggeration, showBathymetry } = useOceanStore();

  if (!showGrid) return null;

  const boxWidth = 20; // Lon
  const boxHeight = 6 * (verticalExaggeration / 5); // Depth
  const boxDepth = 12; // Lat

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Domain Bounding Box */}
      <mesh position={[0, -boxHeight / 2, 0]}>
        <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
        <meshBasicMaterial
          color="#0e7490"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Surface reference boundary */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[boxWidth, boxDepth]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Seafloor bottom boundary mesh (Bathymetric floor placeholder) */}
      {showBathymetry && (
        <mesh position={[0, -boxHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[boxWidth, boxDepth, 16, 16]} />
          <meshStandardMaterial
            color="#091b29"
            roughness={0.9}
            metalness={0.1}
            wireframe={false}
          />
        </mesh>
      )}

      {/* Depth level indicator lines */}
      {[-0.2, -0.5, -1.0, -2.0, -4.0].map((normDepth) => {
        const y = (normDepth / 5.0) * boxHeight;
        if (Math.abs(y) > boxHeight) return null;
        return (
          <lineSegments key={normDepth} position={[0, y, 0]}>
            <edgesGeometry
              args={[new THREE.BoxGeometry(boxWidth, 0.01, boxDepth)]}
            />
            <lineBasicMaterial color="#164e63" transparent opacity={0.25} />
          </lineSegments>
        );
      })}
    </group>
  );
};
