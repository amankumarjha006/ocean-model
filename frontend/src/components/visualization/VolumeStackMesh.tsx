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

  // Enforce minimum opacity so deep layers never disappear
  const clampedOpacity = Math.max(0.20, Math.min(0.80, volumeOpacity));

  // Generate an array of DataTextures, one per depth level in the 3D volume
  const layerTextures = useMemo(() => {
    if (!volumeData || !volumeData.data || volumeData.data.length === 0) {
      return [];
    }

    const totalLayers = volumeData.data.length;
    return volumeData.data.map((depthMatrix, idx) => {
      const depthM = volumeData.depths[idx] ?? 0;
      const yPos = -(depthM / maxDepthMeters) * activeBoxHeight;

      // Gentle depth-dependent opacity curve:
      // Surface ~100% of clampedOpacity, deepest ~60% of clampedOpacity.
      // This ensures deep layers remain clearly visible while surface is slightly stronger.
      const depthFraction = idx / Math.max(1, totalLayers - 1);
      const depthAttenuation = 1.0 - depthFraction * 0.4; // range: 1.0 → 0.6
      const layerOpacity = clampedOpacity * depthAttenuation;

      // Create texture with FULL alpha (255) — let the material opacity handle transparency.
      // This prevents the double-opacity multiplication bug where texture alpha * material opacity
      // made deep layers nearly invisible.
      const tex = createDataTexture(
        depthMatrix,
        colorMin,
        colorMax,
        colorScale,
        scaleType,
        255  // Full alpha — opacity is controlled only by the material
      );

      return {
        texture: tex,
        depthM,
        yPos,
        index: idx,
        opacity: layerOpacity,
      };
    });
  }, [volumeData, activeBoxHeight, colorMin, colorMax, colorScale, scaleType, clampedOpacity, maxDepthMeters]);

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
          renderOrder={1000 - layer.index} // Surface first, deep last — correct back-to-front ordering
        >
          <planeGeometry args={[boxWidth, boxDepth, 32, 32]} />
          <meshBasicMaterial
            map={layer.texture}
            transparent
            opacity={layer.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
};
