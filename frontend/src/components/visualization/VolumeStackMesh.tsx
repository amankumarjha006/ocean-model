import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useOceanStore } from '../../store/oceanStore';
import { createDataTexture } from '../../features/visualization/colorTexture';

interface VolumeStackMeshProps {
  boxWidth?: number;
  boxDepth?: number;
  boxHeight?: number;
  maxDepthMeters?: number;
}

const VolumeStackMeshComponent: React.FC<VolumeStackMeshProps> = ({
  boxWidth = 20,
  boxDepth = 12,
  boxHeight = 6,
  maxDepthMeters = 1000,
}) => {
  const volumeData = useOceanStore((s) => s.volumeData);
  const verticalExaggeration = useOceanStore((s) => s.verticalExaggeration);
  const colorScale = useOceanStore((s) => s.colorScale);
  const colorMin = useOceanStore((s) => s.colorMin);
  const colorMax = useOceanStore((s) => s.colorMax);
  const scaleType = useOceanStore((s) => s.scaleType);
  const volumeOpacity = useOceanStore((s) => s.volumeOpacity);

  const activeBoxHeight = boxHeight * (verticalExaggeration / 5);
  const clampedOpacity = Math.max(0.20, Math.min(0.80, volumeOpacity));

  // 1. Generate DataTextures ONLY when volumeData or color parameters change
  const textures = useMemo(() => {
    if (!volumeData || !volumeData.data || volumeData.data.length === 0) {
      return [];
    }

    return volumeData.data.map((depthMatrix) =>
      createDataTexture(
        depthMatrix,
        colorMin,
        colorMax,
        colorScale,
        scaleType,
        255
      )
    );
  }, [volumeData, colorMin, colorMax, colorScale, scaleType]);

  // 2. Properly dispose GPU DataTextures on update or component unmount
  useEffect(() => {
    return () => {
      textures.forEach((tex) => tex.dispose());
    };
  }, [textures]);

  // 3. Compute layer coordinates & opacities without re-creating textures
  const layers = useMemo(() => {
    if (!volumeData || !volumeData.depths || textures.length === 0) {
      return [];
    }

    const totalLayers = textures.length;
    return textures.map((tex, idx) => {
      const depthM = volumeData.depths[idx] ?? 0;
      const yPos = -(depthM / maxDepthMeters) * activeBoxHeight - idx * 0.001;

      const depthFraction = idx / Math.max(1, totalLayers - 1);
      const depthAttenuation = 1.0 - depthFraction * 0.4;
      const layerOpacity = clampedOpacity * depthAttenuation;

      return {
        texture: tex,
        depthM,
        yPos,
        index: idx,
        opacity: layerOpacity,
      };
    });
  }, [textures, volumeData, maxDepthMeters, activeBoxHeight, clampedOpacity]);

  if (!layers.length) {
    return null;
  }

  return (
    <group>
      {layers.map((layer) => (
        <mesh
          key={`vol-layer-${layer.index}`}
          position={[0, layer.yPos, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={1000 - layer.index}
        >
          <planeGeometry args={[boxWidth, boxDepth, 16, 16]} />
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

export const VolumeStackMesh = React.memo(VolumeStackMeshComponent);
