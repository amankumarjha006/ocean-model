import React, { useMemo, useEffect } from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D Ocean Domain Bounding Box and Coordinate Grid Frame.
 */
const CoordinateGridComponent: React.FC = () => {
  const showGrid = useOceanStore((s) => s.showGrid);
  const verticalExaggeration = useOceanStore((s) => s.verticalExaggeration);
  const showBathymetry = useOceanStore((s) => s.showBathymetry);

  const boxWidth = 20;
  const boxHeight = 6 * (verticalExaggeration / 5);
  const boxDepth = 12;

  const minLon = 55;
  const maxLon = 100;
  const minLat = 0;
  const maxLat = 30;

  const edgeGeo = useMemo(() => {
    const boxGeo = new THREE.BoxGeometry(boxWidth, 0.01, boxDepth);
    const edges = new THREE.EdgesGeometry(boxGeo);
    boxGeo.dispose();
    return edges;
  }, [boxWidth, boxDepth]);

  useEffect(() => {
    return () => {
      edgeGeo.dispose();
    };
  }, [edgeGeo]);

  if (!showGrid) return null;

  const depthLevels = [
    { normDepth: -0.2, depthM: 200 },
    { normDepth: -0.5, depthM: 500 },
    { normDepth: -1.0, depthM: 1000 },
  ];

  const lonTicks = [55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
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
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      {/* Surface reference boundary */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[boxWidth, boxDepth]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.10}
          depthWrite={false}
        />
      </mesh>

      {/* Seafloor bottom boundary mesh */}
      {showBathymetry && (
        <mesh position={[0, -boxHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[boxWidth, boxDepth, 16, 16]} />
          <meshBasicMaterial
            color="#091b29"
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Depth level indicator lines + labels */}
      {depthLevels.map(({ normDepth, depthM }) => {
        const y = normDepth * boxHeight;
        if (Math.abs(y) > boxHeight + 0.01) return null;
        return (
          <group key={normDepth}>
            <lineSegments geometry={edgeGeo} position={[0, y, 0]}>
              <lineBasicMaterial color="#3b82f6" transparent opacity={0.12} depthWrite={false} />
            </lineSegments>

            <Text
              position={[-boxWidth / 2 - 0.6, y, boxDepth / 2]}
              fontSize={0.4}
              color="#94a3b8"
              anchorX="right"
              anchorY="middle"
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
      >
        0m
      </Text>

      {/* Longitude tick labels */}
      {lonTicks.filter((_, i) => i % 2 === 0).map((lon) => (
        <Text
          key={`lon-${lon}`}
          position={[lonToX(lon), 0.15, boxDepth / 2 + 0.5]}
          fontSize={0.25}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {`${lon}°E`}
        </Text>
      ))}

      {/* Latitude tick labels */}
      {latTicks.filter((_, i) => i % 2 === 0).map((lat) => (
        <Text
          key={`lat-${lat}`}
          position={[boxWidth / 2 + 0.5, 0.15, latToZ(lat)]}
          fontSize={0.25}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
        >
          {`${lat}°N`}
        </Text>
      ))}
    </group>
  );
};

export const CoordinateGrid = React.memo(CoordinateGridComponent);
