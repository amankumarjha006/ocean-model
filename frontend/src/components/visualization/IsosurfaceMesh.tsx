import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useOceanStore } from '../../store/oceanStore';
import { extractIsosurface } from '../../features/visualization/marchingCubes';
import { samplePalette } from '../../features/visualization/colorTexture';

interface IsosurfaceMeshProps {
  boxWidth?: number;
  boxDepth?: number;
  boxHeight?: number;
  maxDepthMeters?: number;
}

const IsosurfaceMeshComponent: React.FC<IsosurfaceMeshProps> = ({
  boxWidth = 20,
  boxDepth = 12,
  boxHeight = 6,
}) => {
  const volumeData = useOceanStore((s) => s.volumeData);
  const isosurfaceThreshold = useOceanStore((s) => s.isosurfaceThreshold);
  const verticalExaggeration = useOceanStore((s) => s.verticalExaggeration);
  const colorScale = useOceanStore((s) => s.colorScale);
  const colorMin = useOceanStore((s) => s.colorMin);
  const colorMax = useOceanStore((s) => s.colorMax);

  const activeBoxHeight = boxHeight * (verticalExaggeration / 5);

  const domain = useMemo(() => {
    if (!volumeData) {
      return {
        minLon: 55,
        maxLon: 100,
        minLat: 0,
        maxLat: 30,
        depths: [0, 50, 100, 200, 300, 500, 750, 1000],
        boxWidth,
        boxDepth,
        boxHeight: activeBoxHeight,
      };
    }
    return {
      minLon: volumeData.longitudes[0],
      maxLon: volumeData.longitudes[volumeData.longitudes.length - 1],
      minLat: volumeData.latitudes[0],
      maxLat: volumeData.latitudes[volumeData.latitudes.length - 1],
      depths: volumeData.depths,
      boxWidth,
      boxDepth,
      boxHeight: activeBoxHeight,
    };
  }, [volumeData, boxWidth, boxDepth, activeBoxHeight]);

  const geometry = useMemo(() => {
    if (!volumeData || !volumeData.data || volumeData.data.length < 2) {
      return null;
    }
    return extractIsosurface(volumeData.data, isosurfaceThreshold, domain);
  }, [volumeData, isosurfaceThreshold, domain]);

  // Dispose generated marching cubes BufferGeometry on update/unmount
  useEffect(() => {
    return () => {
      if (geometry) geometry.dispose();
    };
  }, [geometry]);

  // Derive color of isosurface from threshold value in current color palette
  const surfaceColor = useMemo(() => {
    const t = Math.max(0, Math.min(1, (isosurfaceThreshold - colorMin) / (colorMax - colorMin || 1)));
    const [r, g, b] = samplePalette(colorScale, t);
    return new THREE.Color(r / 255, g / 255, b / 255);
  }, [isosurfaceThreshold, colorMin, colorMax, colorScale]);

  if (!geometry || geometry.getAttribute('position')?.count === 0) {
    return null;
  }

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={surfaceColor}
        transparent
        opacity={0.88}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

export const IsosurfaceMesh = React.memo(IsosurfaceMeshComponent);
