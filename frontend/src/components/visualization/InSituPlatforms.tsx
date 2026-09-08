import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useOceanStore } from '../../store/oceanStore';

interface InSituPlatformsProps {
  boxWidth?: number;
  boxDepth?: number;
  boxHeight?: number;
  maxDepthMeters?: number;
}

export const InSituPlatforms: React.FC<InSituPlatformsProps> = ({
  boxWidth = 20,
  boxDepth = 12,
  boxHeight = 6,
  maxDepthMeters = 1000,
}) => {
  const {
    showArgo,
    showGliders,
    verticalExaggeration,
    dataset,
    selectedObservation,
    setSelectedObservation,
  } = useOceanStore();

  const activeBoxHeight = boxHeight * (verticalExaggeration / 5);

  const minLon = 55.0;
  const maxLon = 100.0;
  const minLat = 0.0;
  const maxLat = 30.0;

  const toWorld = (lon: number, lat: number, depthM: number): [number, number, number] => {
    const x = -boxWidth / 2 + ((lon - minLon) / (maxLon - minLon)) * boxWidth;
    const z = boxDepth / 2 - ((lat - minLat) / (maxLat - minLat)) * boxDepth;
    const y = -(depthM / maxDepthMeters) * activeBoxHeight;
    return [x, y, z];
  };

  const argoFloats = (dataset?.observations || []).filter((o) => o.platform_type === 'argo');
  const gliders = (dataset?.observations || []).filter((o) => o.platform_type === 'glider');

  return (
    <group>
      {/* Argo Profiling Floats */}
      {showArgo &&
        argoFloats.map((argo) => {
          const lon = (argo.spatial_extent[0] + argo.spatial_extent[2]) / 2;
          const lat = (argo.spatial_extent[1] + argo.spatial_extent[3]) / 2;
          const [x, , z] = toWorld(lon, lat, 0);
          const isSelected = selectedObservation?.id === argo.id;

          const bottomDepth = Math.min(maxDepthMeters, argo.depth_range_m[1] || 1000);
          const bottomY = -(bottomDepth / maxDepthMeters) * activeBoxHeight;

          return (
            <group
              key={argo.id}
              position={[x, 0, z]}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObservation(argo);
              }}
            >
              {/* Floating label above the float */}
              <Html
                position={[0, 1.8, 0]}
                distanceFactor={10}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{
                  background: 'rgba(9, 18, 32, 0.85)',
                  color: isSelected ? '#38bdf8' : '#f59e0b',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: `1px solid ${isSelected ? 'rgba(56,189,248,0.4)' : 'rgba(245,158,11,0.3)'}`,
                  textAlign: 'center',
                }}>
                  {argo.id}
                </div>
              </Html>

              {/* Surface float body — scaled up for visibility */}
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 1.0, 16]} />
                <meshStandardMaterial
                  color={isSelected ? '#38bdf8' : '#f59e0b'}
                  roughness={0.2}
                  emissive={isSelected ? '#0284c7' : '#000000'}
                  emissiveIntensity={0.6}
                />
              </mesh>

              {/* Antenna */}
              <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>

              {/* Blinking signal beacon */}
              <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.09, 8, 8]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>

              {/* Profiling depth trajectory line */}
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(self) => {
                    self.setFromPoints([
                      new THREE.Vector3(0, 0, 0),
                      new THREE.Vector3(0, bottomY, 0),
                    ]);
                  }}
                />
                <lineDashedMaterial
                  attach="material"
                  color={isSelected ? '#38bdf8' : '#f59e0b'}
                  dashSize={0.25}
                  gapSize={0.12}
                />
              </line>

              {/* Bottom sensor package */}
              <mesh position={[0, bottomY, 0]}>
                <sphereGeometry args={[0.2, 12, 12]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
            </group>
          );
        })}

      {/* Autonomous Ocean Gliders */}
      {showGliders &&
        gliders.map((glider) => {
          const lon = (glider.spatial_extent[0] + glider.spatial_extent[2]) / 2;
          const lat = (glider.spatial_extent[1] + glider.spatial_extent[3]) / 2;
          const [x, , z] = toWorld(lon, lat, 0);
          const isSelected = selectedObservation?.id === glider.id;

          const gliderY = -(350 / maxDepthMeters) * activeBoxHeight;

          return (
            <group
              key={glider.id}
              position={[x, gliderY, z]}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObservation(glider);
              }}
            >
              {/* Floating label above the glider */}
              <Html
                position={[0, 1.2, 0]}
                distanceFactor={10}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{
                  background: 'rgba(9, 18, 32, 0.85)',
                  color: isSelected ? '#38bdf8' : '#10b981',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: `1px solid ${isSelected ? 'rgba(56,189,248,0.4)' : 'rgba(16,185,129,0.3)'}`,
                  textAlign: 'center',
                }}>
                  {glider.id}
                </div>
              </Html>

              {/* Torpedo Glider fuselage */}
              <mesh rotation={[0.2, 0.5, 0]}>
                <coneGeometry args={[0.22, 1.2, 8]} />
                <meshStandardMaterial
                  color={isSelected ? '#38bdf8' : '#10b981'}
                  roughness={0.3}
                  emissive={isSelected ? '#059669' : '#000000'}
                  emissiveIntensity={0.5}
                />
              </mesh>

              {/* Swept wings */}
              <mesh rotation={[0, 0.5, 0]}>
                <boxGeometry args={[1.6, 0.03, 0.22]} />
                <meshStandardMaterial color="#10b981" />
              </mesh>

              {/* Vertical stabilizer */}
              <mesh position={[0, 0.2, 0.35]} rotation={[0, 0.5, 0]}>
                <boxGeometry args={[0.03, 0.4, 0.2]} />
                <meshStandardMaterial color="#10b981" />
              </mesh>
            </group>
          );
        })}
    </group>
  );
};
