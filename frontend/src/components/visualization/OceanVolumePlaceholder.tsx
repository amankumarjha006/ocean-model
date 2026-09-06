import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useOceanStore } from '../../store/oceanStore';
import * as THREE from 'three';

export const OceanVolumePlaceholder: React.FC = () => {
  const {
    showOceanVolume,
    showCurrents,
    showArgo,
    showGliders,
    selectedDepth,
    verticalExaggeration,
    colorScale,
  } = useOceanStore();

  const surfaceMeshRef = useRef<THREE.Mesh>(null);
  const slicePlaneRef = useRef<THREE.Mesh>(null);

  const boxWidth = 20;
  const totalDepthMeters = 5000;
  const boxHeight = 6 * (verticalExaggeration / 5);
  const boxDepth = 12;

  // Normalized Y position for the selected depth slice (0m at y=0, 5000m at y=-boxHeight)
  const sliceY = -(selectedDepth / totalDepthMeters) * boxHeight;

  // Dynamic color for slice plane based on palette and active variable
  const getSliceColor = () => {
    switch (colorScale) {
      case 'thermal': return '#ea580c';
      case 'haline': return '#059669';
      case 'algae': return '#16a34a';
      case 'coolwarm': return '#2563eb';
      case 'speed': return '#d97706';
      default: return '#0891b2';
    }
  };

  // Subtle wave animation on surface plane
  useFrame(({ clock }) => {
    if (surfaceMeshRef.current) {
      surfaceMeshRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.05;
    }
  });

  return (
    <group>
      {/* Surface Water Plane (0m) */}
      <mesh
        ref={surfaceMeshRef}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[boxWidth, boxDepth, 32, 32]} />
        <meshStandardMaterial
          color="#0e7490"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dynamic Slicing Plane at Selected Depth */}
      {showOceanVolume && (
        <mesh
          ref={slicePlaneRef}
          position={[0, sliceY, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[boxWidth, boxDepth, 16, 16]} />
          <meshStandardMaterial
            color={getSliceColor()}
            roughness={0.3}
            metalness={0.4}
            transparent
            opacity={selectedDepth === 0 ? 0.35 : 0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Ocean Current Vectors (Placeholder Flow Field) */}
      {showCurrents && (
        <group position={[0, sliceY + 0.1, 0]}>
          {[-7, -3.5, 0, 3.5, 7].flatMap((x) =>
            [-4, -2, 0, 2, 4].map((z) => {
              // Synthetic swirl direction
              const angle = Math.atan2(z, x) + Math.PI / 2;
              const len = 0.9;
              return (
                <group key={`${x}-${z}`} position={[x, 0, z]} rotation={[0, -angle, 0]}>
                  {/* Arrow stem */}
                  <mesh position={[0, 0, len / 2]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, len, 8]} />
                    <meshBasicMaterial color="#38bdf8" />
                  </mesh>
                  {/* Arrow cone */}
                  <mesh position={[0, 0, len + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.12, 0.3, 8]} />
                    <meshBasicMaterial color="#7dd3fc" />
                  </mesh>
                </group>
              );
            })
          )}
        </group>
      )}

      {/* Argo Profiling Floats (In-situ Platforms) */}
      {showArgo && (
        <group>
          {/* Float #2903334 (Arabian Sea: ~67°E, 15°N) */}
          <group position={[-4.5, 0, 1.2]}>
            {/* Surface float body */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.3} />
            </mesh>
            {/* Antenna */}
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Vertical profiling line down to 2000m */}
            <line>
              <bufferGeometry
                attach="geometry"
                onUpdate={(self) => {
                  const points = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, -(2000 / totalDepthMeters) * boxHeight, 0),
                  ];
                  self.setFromPoints(points);
                }}
              />
              <lineDashedMaterial
                attach="material"
                color="#f59e0b"
                dashSize={0.2}
                gapSize={0.1}
              />
            </line>
          </group>

          {/* Float #2903335 (Bay of Bengal: ~87°E, 12°N) */}
          <group position={[4.2, 0, -0.5]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <line>
              <bufferGeometry
                attach="geometry"
                onUpdate={(self) => {
                  const points = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, -(1850 / totalDepthMeters) * boxHeight, 0),
                  ];
                  self.setFromPoints(points);
                }}
              />
              <lineDashedMaterial
                attach="material"
                color="#f59e0b"
                dashSize={0.2}
                gapSize={0.1}
              />
            </line>
          </group>
        </group>
      )}

      {/* Autonomous Ocean Glider Trajectory */}
      {showGliders && (
        <group position={[-1.5, -(1000 / totalDepthMeters) * boxHeight * 0.4, -1.8]}>
          {/* Glider body */}
          <mesh rotation={[0.2, 0.4, 0]}>
            <coneGeometry args={[0.25, 1.2, 8]} />
            <meshStandardMaterial color="#10b981" roughness={0.4} />
          </mesh>
          {/* Wings */}
          <mesh rotation={[0, 0.4, 0]}>
            <boxGeometry args={[1.5, 0.04, 0.2]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
        </group>
      )}
    </group>
  );
};
