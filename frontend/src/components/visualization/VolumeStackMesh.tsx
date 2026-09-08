import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useOceanStore } from '../../store/oceanStore';
import { createDataTexture } from '../../features/visualization/colorTexture';

interface VolumeStackMeshProps {
  boxWidth?: number;
  boxDepth?: number;
  boxHeight?: number;
  maxDepthMeters?: number;
}

export const VolumeStackMesh: React.FC<VolumeStackMeshProps> = ({
  boxWidth = 20,
  boxDepth = 12,
  boxHeight = 6,
  maxDepthMeters = 1000,
}) => {
  const {
    volumeData,
    verticalExaggeration,
    colorScale,
    colorMin,
    colorMax,
    scaleType,
    volumeOpacity,
  } = useOceanStore();

  const activeBoxHeight = boxHeight * (verticalExaggeration / 5);

  // Generate an array of DataTextures, one per depth level in the 3D volume
  const layerTextures = useMemo(() => {
    if (!volumeData || !volumeData.data || volumeData.data.length === 0) {
      return [];
    }

    const totalLayers = volumeData.data.length;
    return volumeData.data.map((depthMatrix, idx) => {
      const depthM = volumeData.depths[idx] ?? 0;
      const yPos = -(depthM / maxDepthMeters) * activeBoxHeight;

      // Depth-dependent opacity: surface layers more visible, deep layers fade
      const depthFraction = idx / Math.max(1, totalLayers - 1);
      const layerOpacity = volumeOpacity * (1.0 - depthFraction * 0.5);

      const tex = createDataTexture(
        depthMatrix,
        colorMin,
        colorMax,
        colorScale,
        scaleType,
        Math.round(layerOpacity * 255)
      );

      return {
        texture: tex,
        depthM,
        yPos,
        index: idx,
        opacity: layerOpacity,
      };
    });
  }, [volumeData, activeBoxHeight, colorMin, colorMax, colorScale, scaleType, volumeOpacity, maxDepthMeters]);

  if (!layerTextures.length) {
    return null;
  }

  return (
    <group>
      {layerTextures.map((layer) => (
        <mesh
          key={`vol-layer-${layer.index}`}
          position={[0, layer.yPos, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[boxWidth, boxDepth, 32, 32]} />
          <meshBasicMaterial
            map={layer.texture}
            transparent
            opacity={layer.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};
