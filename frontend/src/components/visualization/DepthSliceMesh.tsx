import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useOceanStore } from '../../store/oceanStore';
import { createDataTexture } from '../../features/visualization/colorTexture';

interface DepthSliceMeshProps {
  boxWidth?: number;
  boxDepth?: number;
  boxHeight?: number;
  maxDepthMeters?: number;
  overrideOpacity?: number;
}

const DepthSliceMeshComponent: React.FC<DepthSliceMeshProps> = ({
  boxWidth = 20,
  boxDepth = 12,
  boxHeight = 6,
  maxDepthMeters = 1000,
  overrideOpacity,
}) => {
  const currentSlice = useOceanStore((s) => s.currentSlice);
  const selectedDepth = useOceanStore((s) => s.selectedDepth);
  const verticalExaggeration = useOceanStore((s) => s.verticalExaggeration);
  const colorScale = useOceanStore((s) => s.colorScale);
  const colorMin = useOceanStore((s) => s.colorMin);
  const colorMax = useOceanStore((s) => s.colorMax);
  const scaleType = useOceanStore((s) => s.scaleType);
  const setHoveredPoint = useOceanStore((s) => s.setHoveredPoint);

  const animFrameRef = useRef<number | null>(null);

  const activeBoxHeight = boxHeight * (verticalExaggeration / 5);
  const sliceY = -(selectedDepth / maxDepthMeters) * activeBoxHeight - 0.002;
  const finalOpacity = overrideOpacity ?? 0.95;

  // Generate GPU DataTexture from live backend slice matrix
  const texture = useMemo(() => {
    if (!currentSlice || !currentSlice.data || currentSlice.data.length === 0) {
      return null;
    }
    return createDataTexture(
      currentSlice.data,
      colorMin,
      colorMax,
      colorScale,
      scaleType,
      255
    );
  }, [currentSlice, colorMin, colorMax, colorScale, scaleType]);

  // Dispose texture memory when updated or unmounted
  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  // Cleanup animation frame timer on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.uv || !currentSlice || !currentSlice.data) return;

    const nativeX = e.nativeEvent.clientX;
    const nativeY = e.nativeEvent.clientY;
    const uvX = e.uv.x;
    const uvY = e.uv.y;

    if (animFrameRef.current !== null) return;

    animFrameRef.current = requestAnimationFrame(() => {
      animFrameRef.current = null;
      if (!currentSlice || !currentSlice.data) return;

      const nLat = currentSlice.data.length;
      const nLon = currentSlice.data[0].length;

      const u = Math.max(0, Math.min(1, uvX));
      const v = Math.max(0, Math.min(1, uvY));

      const minLon = currentSlice.longitudes[0] ?? 55.0;
      const maxLon = currentSlice.longitudes[currentSlice.longitudes.length - 1] ?? 100.0;
      const minLat = currentSlice.latitudes[0] ?? 0.0;
      const maxLat = currentSlice.latitudes[currentSlice.latitudes.length - 1] ?? 30.0;

      const lon = minLon + u * (maxLon - minLon);
      const lat = minLat + v * (maxLat - minLat);

      const latIdx = Math.max(0, Math.min(nLat - 1, Math.round(v * (nLat - 1))));
      const lonIdx = Math.max(0, Math.min(nLon - 1, Math.round(u * (nLon - 1))));

      const val = currentSlice.data[latIdx]?.[lonIdx] ?? 0;

      setHoveredPoint({
        lat: Math.round(lat * 100) / 100,
        lon: Math.round(lon * 100) / 100,
        depth: Math.round(selectedDepth),
        val: Math.round(val * 100) / 100,
        varName: currentSlice.display_name,
        units: currentSlice.units,
        x: nativeX,
        y: nativeY,
      });
    });
  };

  const handlePointerLeave = () => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setHoveredPoint(null);
  };

  if (!texture) {
    return (
      <mesh
        position={[0, sliceY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[boxWidth, boxDepth]} />
        <meshBasicMaterial
          color="#1e293b"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    );
  }

  return (
    <mesh
      position={[0, sliceY, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <planeGeometry args={[boxWidth, boxDepth, 32, 32]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={finalOpacity}
        side={THREE.DoubleSide}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
};

export const DepthSliceMesh = React.memo(DepthSliceMeshComponent);
