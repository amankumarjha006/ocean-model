import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D Ocean Domain Bounding Box and Coordinate Grid Frame.
 * Scaled:
 * X: Longitude (55°E to 100°E) -> mapped to [-10, 10]
 * Y: Depth (0m to -1000m) -> mapped to [0, -6] * verticalExaggeration
 * Z: Latitude (0°N to 30°N) -> mapped to [-6, 6]
 */
export const CoordinateGrid: React.FC = () => {
  const { showGrid, verticalExaggeration, showBathymetry } = useOceanStore();

  if (!showGrid) return null;

  const boxWidth = 20; // Lon
  const boxHeight = 6 * (verticalExaggeration / 5); // Depth
  const boxDepth = 12; // Lat

  // Domain coordinate ranges
  const minLon = 55;
  const maxLon = 100;
  const minLat = 0;
  const maxLat = 30;

  // Depth levels for reference lines and labels (normalized: fraction of maxDepthM/5)
  const depthLevels = [
    { normDepth: -0.2, depthM: 200 },
    { normDepth: -0.5, depthM: 500 },
    { normDepth: -1.0, depthM: 1000 },
  ];

  // Longitude tick positions (every 5° from 55 to 100)
  const lonTicks = [55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  // Latitude tick positions (every 5° from 0 to 30)
  const latTicks = [0, 5, 10, 15, 20, 25, 30];

  const lonToX = (lon: number) => -boxWidth / 2 + ((lon - minLon) / (maxLon - minLon)) * boxWidth;
  const latToZ = (lat: number) => boxDepth / 2 - ((lat - minLat) / (maxLat - minLat)) * boxDepth;

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Domain Bounding Box */}
      <mesh position={[0, -boxHeight / 2, 0]}>
        <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.12} // Subtler to let data dominate
        />
      </mesh>

      {/* Surface reference boundary */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[boxWidth, boxDepth]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.10} // Subtler
        />
      </mesh>

      {/* Seafloor bottom boundary mesh (Bathymetric floor placeholder) */}
      {showBathymetry && (
        <mesh position={[0, -boxHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[boxWidth, boxDepth, 16, 16]} />
          <meshBasicMaterial
            color="#091b29"
          />
        </mesh>
      )}

      {/* Depth level indicator lines + labels */}
      {depthLevels.map(({ normDepth, depthM }) => {
        // Note: normDepth is already scaled properly so we just multiply by active box height
        // Since Y mapping is y = -(depth / maxDepth) * activeBoxHeight
        const y = normDepth * boxHeight;
        if (Math.abs(y) > boxHeight) return null;
        return (
          <group key={normDepth}>
            <lineSegments position={[0, y, 0]}>
              <edgesGeometry
                args={[new THREE.BoxGeometry(boxWidth, 0.01, boxDepth)]}
              />
              <lineBasicMaterial color="#3b82f6" transparent opacity={0.12} /> {/* Subtler */}
            </lineSegments>
            {/* Depth tick label at left edge, billboarded */}
            <Text
              position={[-boxWidth / 2 - 0.6, y, boxDepth / 2]}
              fontSize={0.4}
              color="#94a3b8"
              anchorX="right"
              anchorY="middle"
              font={undefined}
            >
              {`${depthM}m`}
            </Text>
          </group>
        );
      })}

      {/* Surface depth label (0m) */}
      <Text
        position={[-boxWidth / 2 - 0.6, 0, boxDepth / 2]}
        fontSize={0.4}
        color="#94a3b8"
        anchorX="right"
        anchorY="middle"
        font={undefined}
      >
        0m
      </Text>

      {/* Longitude tick labels along the front edge (Z = boxDepth/2, Y = 0) */}
      {lonTicks.filter((_, i) => i % 2 === 0).map((lon) => (
        <Text
          key={`lon-${lon}`}
          position={[lonToX(lon), 0.15, boxDepth / 2 + 0.5]}
          fontSize={0.25}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {`${lon}°E`}
        </Text>
      ))}

      {/* Latitude tick labels along the right edge (X = boxWidth/2, Y = 0) */}
      {latTicks.filter((_, i) => i % 2 === 0).map((lat) => (
        <Text
          key={`lat-${lat}`}
          position={[boxWidth / 2 + 0.5, 0.15, latToZ(lat)]}
          fontSize={0.25}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
          font={undefined}
        >
          {`${lat}°N`}
        </Text>
      ))}
    </group>
  );
};
