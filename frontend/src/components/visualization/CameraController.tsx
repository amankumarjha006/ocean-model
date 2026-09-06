import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOceanStore } from '../../store/oceanStore';

export const CameraController: React.FC = () => {
  const { cameraPreset } = useOceanStore();
  const { camera } = useThree();
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(18, 14, 22));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, -2, 0));
  const isTransitioning = useRef<boolean>(false);

  useEffect(() => {
    switch (cameraPreset) {
      case 'top':
        targetPos.current.set(0, 26, 0.01);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'side':
        targetPos.current.set(0, -2, 28);
        targetLookAt.current.set(0, -2, 0);
        break;
      case 'default':
      default:
        targetPos.current.set(18, 14, 22);
        targetLookAt.current.set(0, -2, 0);
        break;
    }
    isTransitioning.current = true;
  }, [cameraPreset]);

  useFrame(() => {
    if (!isTransitioning.current) return;

    camera.position.lerp(targetPos.current, 0.08);

    if (camera.position.distanceTo(targetPos.current) < 0.2) {
      camera.position.copy(targetPos.current);
      isTransitioning.current = false;
    }
  });

  return null;
};
