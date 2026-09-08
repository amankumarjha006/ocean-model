import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useOceanStore } from '../../store/oceanStore';
import { samplePalette } from '../../features/visualization/colorTexture';

interface CurrentFlowFieldProps {
  boxWidth?: number;
  boxDepth?: number;
  boxHeight?: number;
  maxDepthMeters?: number;
}

const CurrentFlowFieldComponent: React.FC<CurrentFlowFieldProps> = ({
  boxWidth = 20,
  boxDepth = 12,
  boxHeight = 6,
  maxDepthMeters = 1000,
}) => {
  const uSlice = useOceanStore((s) => s.uSlice);
  const vSlice = useOceanStore((s) => s.vSlice);
  const selectedDepth = useOceanStore((s) => s.selectedDepth);
  const verticalExaggeration = useOceanStore((s) => s.verticalExaggeration);
  const currentDensity = useOceanStore((s) => s.currentDensity);
  const currentSpeedScale = useOceanStore((s) => s.currentSpeedScale);
  const currentOpacity = useOceanStore((s) => s.currentOpacity);

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const activeBoxHeight = boxHeight * (verticalExaggeration / 5);
  const sliceY = -(selectedDepth / maxDepthMeters) * activeBoxHeight;

  // Arrow Geometry (stem cylinder + tip cone merged)
  const arrowGeometry = useMemo(() => {
    const cylinder = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6);
    cylinder.translate(0, 0.25, 0);

    const cone = new THREE.ConeGeometry(0.08, 0.25, 8);
    cone.translate(0, 0.5 + 0.125, 0);

    const merged = new THREE.BufferGeometry();
    const pos1 = cylinder.getAttribute('position');
    const pos2 = cone.getAttribute('position');

    const totalVertices = pos1.count + pos2.count;
    const positions = new Float32Array(totalVertices * 3);

    positions.set(pos1.array, 0);
    positions.set(pos2.array, pos1.array.length);

    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    merged.computeVertexNormals();
    merged.rotateX(Math.PI / 2);

    cylinder.dispose();
    cone.dispose();

    return merged;
  }, []);

  useEffect(() => {
    return () => {
      arrowGeometry.dispose();
    };
  }, [arrowGeometry]);

  // Compute instance matrices and colors
  const { instanceCount, matrices, colors, particleVectors } = useMemo(() => {
    if (!uSlice?.data || !vSlice?.data) {
      return { instanceCount: 0, matrices: [], colors: [], particleVectors: [] };
    }

    const nLat = uSlice.data.length;
    const nLon = uSlice.data[0].length;

    let globalMaxSpeed = 0;
    for (let iz = 0; iz < nLat; iz++) {
      for (let ix = 0; ix < nLon; ix++) {
        const u = uSlice.data[iz][ix] ?? 0;
        const v = vSlice.data[iz][ix] ?? 0;
        const sp = Math.hypot(u, v);
        if (sp > globalMaxSpeed) globalMaxSpeed = sp;
      }
    }
    const speedCutoff = globalMaxSpeed * 0.05;

    const step = Math.max(2, currentDensity * 2);

    const matList: THREE.Matrix4[] = [];
    const colList: THREE.Color[] = [];
    const pVectors: { x: number; z: number; u: number; v: number; speed: number }[] = [];

    const dummy = new THREE.Object3D();

    for (let iz = 0; iz < nLat; iz += step) {
      const worldZ = boxDepth / 2 - (iz / (nLat - 1)) * boxDepth;

      for (let ix = 0; ix < nLon; ix += step) {
        const worldX = -boxWidth / 2 + (ix / (nLon - 1)) * boxWidth;

        const u = uSlice.data[iz][ix] ?? 0;
        const v = vSlice.data[iz][ix] ?? 0;
        const speed = Math.hypot(u, v);

        if (speed < speedCutoff) continue;

        const angle = Math.atan2(-v, u);

        dummy.position.set(worldX, sliceY + 0.06, worldZ);
        dummy.rotation.set(0, angle - Math.PI / 2, 0);

        const normalizedSpeed = globalMaxSpeed > 0 ? speed / globalMaxSpeed : 0.5;
        const arrowScale = Math.min(2.0, Math.max(0.3, normalizedSpeed * currentSpeedScale * 2.0));
        dummy.scale.set(arrowScale, arrowScale, arrowScale);
        dummy.updateMatrix();

        matList.push(dummy.matrix.clone());

        const t = Math.max(0, Math.min(1, normalizedSpeed));
        const [r, g, b] = samplePalette('speed', t);
        colList.push(new THREE.Color(r / 255, g / 255, b / 255));

        pVectors.push({ x: worldX, z: worldZ, u, v, speed });
      }
    }

    return {
      instanceCount: matList.length,
      matrices: matList,
      colors: colList,
      particleVectors: pVectors,
    };
  }, [uSlice, vSlice, boxWidth, boxDepth, sliceY, currentDensity, currentSpeedScale]);

  // Update instanced mesh buffer attributes ONCE on data change
  useEffect(() => {
    const mesh = instancedMeshRef.current;
    if (!mesh || instanceCount === 0) return;

    for (let i = 0; i < instanceCount; i++) {
      mesh.setMatrixAt(i, matrices[i]);
      if (colors[i]) mesh.setColorAt(i, colors[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instanceCount, matrices, colors]);

  // Streamline particle geometry
  const particleCount = 200;
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * boxWidth;
      positions[i * 3 + 1] = sliceY + 0.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * boxDepth;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [boxWidth, boxDepth, sliceY]);

  useEffect(() => {
    return () => {
      particleGeo.dispose();
    };
  }, [particleGeo]);

  useFrame((_, delta) => {
    if (!particlesRef.current || particleVectors.length === 0) return;

    const posAttr = particlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    if (!posAttr) return;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      let x = arr[i * 3];
      let z = arr[i * 3 + 2];

      let cu = 0.3;
      let cv = 0.0;
      let minD = 999;

      for (let k = 0; k < Math.min(20, particleVectors.length); k++) {
        const idx = (i * 3 + k) % particleVectors.length;
        const p = particleVectors[idx];
        const dist = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
        if (dist < minD) {
          minD = dist;
          cu = p.u;
          cv = p.v;
        }
      }

      const dt = delta * 4 * currentSpeedScale;
      x += cu * dt;
      z -= cv * dt;

      if (x > boxWidth / 2) x = -boxWidth / 2;
      if (x < -boxWidth / 2) x = boxWidth / 2;
      if (z > boxDepth / 2) z = -boxDepth / 2;
      if (z < -boxDepth / 2) z = boxDepth / 2;

      arr[i * 3] = x;
      arr[i * 3 + 1] = sliceY + 0.08;
      arr[i * 3 + 2] = z;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <group>
      {instanceCount > 0 && (
        <instancedMesh
          ref={instancedMeshRef}
          args={[arrowGeometry, undefined, instanceCount]}
        >
          <meshStandardMaterial
            roughness={0.35}
            metalness={0.4}
            transparent
            opacity={currentOpacity}
            depthWrite={false}
          />
        </instancedMesh>
      )}

      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          size={0.12}
          color="#7dd3fc"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export const CurrentFlowField = React.memo(CurrentFlowFieldComponent);
