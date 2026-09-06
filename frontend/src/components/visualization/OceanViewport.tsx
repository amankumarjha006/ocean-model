import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CoordinateGrid } from './CoordinateGrid';
import { DepthSliceMesh } from './DepthSliceMesh';
import { VolumeStackMesh } from './VolumeStackMesh';
import { CurrentFlowField } from './CurrentFlowField';
import { IsosurfaceMesh } from './IsosurfaceMesh';
import { InSituPlatforms } from './InSituPlatforms';
import { CameraController } from './CameraController';
import { ViewportHUD } from './ViewportHUD';
import { useOceanStore } from '../../store/oceanStore';
import { fetchSlice, fetchVolume } from '../../services/api';

export const OceanViewport: React.FC = () => {
  const {
    vizMode,
    selectedVariable,
    selectedTimeIndex,
    selectedDepth,
    selectedScenario,
    volumeLayerCount,
    setCurrentSlice,
    setVolumeData,
    setUSlice,
    setVSlice,
    dataset,
  } = useOceanStore();

  // Determine active depth index
  const depthValues = dataset?.coordinates?.depth?.values || [0];
  let depthIdx = depthValues.findIndex((d) => Math.abs(d - selectedDepth) < 1e-3);
  if (depthIdx === -1) {
    // Find closest
    depthIdx = depthValues.reduce(
      (bestIdx, d, idx) => (Math.abs(d - selectedDepth) < Math.abs(depthValues[bestIdx] - selectedDepth) ? idx : bestIdx),
      0
    );
  }

  // Fetch active slice data on variable, time, depth, or scenario change
  useEffect(() => {
    let isCancelled = false;

    const loadSlice = async () => {
      try {
        const sliceData = await fetchSlice(
          selectedVariable,
          selectedTimeIndex,
          depthIdx,
          selectedScenario
        );
        if (!isCancelled) {
          setCurrentSlice(sliceData);
        }
      } catch (err) {
        console.warn('Failed to load active slice:', err);
      }
    };

    loadSlice();
    return () => {
      isCancelled = true;
    };
  }, [selectedVariable, selectedTimeIndex, depthIdx, selectedScenario, setCurrentSlice]);

  // Fetch live current vectors (u_current, v_current) when in currents mode or current vectors toggled
  useEffect(() => {
    let isCancelled = false;

    const loadCurrents = async () => {
      try {
        const [uData, vData] = await Promise.all([
          fetchSlice('u_current', selectedTimeIndex, depthIdx, selectedScenario),
          fetchSlice('v_current', selectedTimeIndex, depthIdx, selectedScenario),
        ]);
        if (!isCancelled) {
          setUSlice(uData);
          setVSlice(vData);
        }
      } catch (err) {
        console.warn('Failed to load current vector slices:', err);
      }
    };

    loadCurrents();
    return () => {
      isCancelled = true;
    };
  }, [selectedTimeIndex, depthIdx, selectedScenario, setUSlice, setVSlice]);

  // Fetch 3D Volume data when in volume or isosurface mode
  useEffect(() => {
    if (vizMode !== 'volume' && vizMode !== 'isosurface') return;

    let isCancelled = false;

    const loadVolume = async () => {
      try {
        const vol = await fetchVolume(
          selectedVariable,
          selectedTimeIndex,
          selectedScenario,
          volumeLayerCount
        );
        if (!isCancelled) {
          setVolumeData(vol);
        }
      } catch (err) {
        console.warn('Failed to load 3D volume tensor:', err);
      }
    };

    loadVolume();
    return () => {
      isCancelled = true;
    };
  }, [vizMode, selectedVariable, selectedTimeIndex, selectedScenario, volumeLayerCount, setVolumeData]);

  return (
    <div className="ocean-viewport-container" id="ocean-viewport">
      <Canvas
        className="r3f-canvas"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#030712']} />

        {/* Lighting scheme optimized for subsurface ocean depth perception */}
        <ambientLight intensity={0.65} color="#e0f2fe" />
        <directionalLight position={[15, 25, 15]} intensity={1.2} color="#ffffff" castShadow />
        <directionalLight position={[-12, -10, -12]} intensity={0.45} color="#0369a1" />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#38bdf8" />

        {/* Camera and Dynamic Preset Animation */}
        <PerspectiveCamera makeDefault position={[18, 14, 22]} fov={45} />
        <CameraController />

        {/* Interactive Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={4}
          maxDistance={70}
          target={[0, -2, 0]}
        />

        {/* 3D Scientific Scene Elements */}
        <Suspense fallback={null}>
          <CoordinateGrid />

          {/* Surface Boundary Plane (0m) */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 12]} />
            <meshStandardMaterial
              color="#0e7490"
              roughness={0.1}
              metalness={0.8}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Mode 1: Depth Slice (Primary horizontal field) */}
          {vizMode === 'slice' && (
            <>
              <DepthSliceMesh />
              <CurrentFlowField />
            </>
          )}

          {/* Mode 2: 3D Layered Volume Stack */}
          {vizMode === 'volume' && (
            <>
              <VolumeStackMesh />
              <DepthSliceMesh />
            </>
          )}

          {/* Mode 3: Current Vector Flow Field */}
          {vizMode === 'currents' && (
            <>
              <DepthSliceMesh />
              <CurrentFlowField />
            </>
          )}

          {/* Mode 4: 3D Isosurface */}
          {vizMode === 'isosurface' && (
            <>
              <IsosurfaceMesh />
              <DepthSliceMesh />
            </>
          )}

          {/* In-situ Observation Platforms (Argo Floats & Gliders) */}
          <InSituPlatforms />
        </Suspense>
      </Canvas>

      {/* Floating Interactive Scientific HUD Overlays */}
      <ViewportHUD />
    </div>
  );
};
