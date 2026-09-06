import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOceanStore } from '../../store/oceanStore';

export const CameraController: React.FC = () => {
  const { cameraPreset } = useOceanStore();
  const { camera } = useThree();
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(16, 12, 18));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, -2, 0));
  const isTransitioning = useRef<boolean>(false);

  useEffect(() => {
    switch (cameraPreset) {
      case 'top':
        targetPos.current.set(0, 24, 0.01);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'side':
        targetPos.current.set(0, -2, 26);
        targetLookAt.current.set(0, -2, 0);
        break;
      case 'default':
      default:
        targetPos.current.set(16, 12, 18);
        targetLookAt.current.set(0, -2, 0);
        break;
    }
    isTransitioning.current = true;
  }, [cameraPreset]);

  useFrame(() => {
    if (!isTransitioning.current) return;

    camera.position.lerp(targetPos.current, 0.06);

    if (camera.position.distanceTo(targetPos.current) < 0.2) {
      camera.position.copy(targetPos.current);
      isTransitioning.current = false;
    }
  });

  return null;
};
