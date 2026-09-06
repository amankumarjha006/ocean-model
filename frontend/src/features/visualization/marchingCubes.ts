import * as THREE from 'three';

// Edge table: bitmask for edges intersected by the isosurface for each 256 cube configurations
export const EDGE_TABLE = new Int32Array([
  0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, 0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
  0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c, 0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
  0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c, 0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
  0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac, 0xba0, 0xaa9, 0x9a3, 0x8aa, 0xfa6, 0xeaf, 0xda5, 0xca0,
  0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c, 0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
  0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc, 0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
  0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c, 0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
  0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc, 0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
  0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc, 0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
  0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c, 0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
  0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc, 0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
  0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c, 0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
  0xca0, 0xda5, 0xeaf, 0xfa6, 0x8aa, 0x9a3, 0xaa9, 0xba0, 0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
  0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c, 0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
  0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c, 0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
  0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c, 0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
]);

// Triangle table: for each configuration, lists edges to connect as triangles (-1 terminated)
export const TRI_TABLE = [
  [-1],
  [0, 8, 3, -1],
  [0, 1, 9, -1],
  [1, 8, 3, 9, 8, 1, -1],
  [1, 2, 10, -1],
  [0, 8, 3, 1, 2, 10, -1],
  [9, 2, 10, 0, 2, 9, -1],
  [2, 8, 3, 2, 10, 8, 10, 9, 8, -1],
  [3, 11, 2, -1],
  [0, 11, 2, 8, 11, 0, -1],
  [1, 9, 0, 2, 3, 11, -1],
  [1, 11, 2, 1, 9, 11, 9, 8, 11, -1],
  [3, 10, 1, 11, 10, 3, -1],
  [0, 10, 1, 0, 8, 10, 8, 11, 10, -1],
  [3, 9, 0, 3, 11, 9, 11, 10, 9, -1],
  [9, 8, 10, 10, 8, 11, -1],
  [4, 7, 8, -1],
  [4, 3, 0, 7, 3, 4, -1],
  [0, 1, 9, 8, 4, 7, -1],
  [4, 1, 9, 4, 7, 1, 7, 3, 1, -1],
  [1, 2, 10, 8, 4, 7, -1],
  [3, 4, 7, 3, 0, 4, 1, 2, 10, -1],
  [9, 2, 10, 9, 0, 2, 8, 4, 7, -1],
  [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1],
  [8, 4, 7, 3, 11, 2, -1],
  [11, 4, 7, 11, 2, 4, 2, 0, 4, -1],
  [9, 0, 1, 8, 4, 7, 2, 3, 11, -1],
  [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1],
  [3, 10, 1, 3, 11, 10, 7, 8, 4, -1],
  [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1],
  [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1],
  [4, 7, 11, 4, 11, 9, 9, 11, 10, -1],
  [9, 5, 4, -1],
  [9, 5, 4, 0, 8, 3, -1],
  [0, 5, 4, 1, 5, 0, -1],
  [8, 5, 4, 8, 3, 5, 3, 1, 5, -1],
  [1, 2, 10, 9, 5, 4, -1],
  [3, 0, 8, 1, 2, 10, 4, 9, 5, -1],
  [5, 2, 10, 5, 4, 2, 4, 0, 2, -1],
  [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1],
  [9, 5, 4, 2, 3, 11, -1],
  [0, 11, 2, 0, 8, 11, 4, 9, 5, -1],
  [0, 5, 4, 0, 1, 5, 2, 3, 11, -1],
  [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1],
  [10, 3, 11, 10, 1, 3, 9, 5, 4, -1],
  [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1],
  [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1],
  [5, 4, 8, 5, 8, 10, 10, 8, 11, -1],
  [9, 7, 8, 5, 7, 9, -1],
  [9, 3, 0, 9, 5, 3, 5, 7, 3, -1],
  [0, 7, 8, 0, 1, 7, 1, 5, 7, -1],
  [1, 5, 3, 3, 5, 7, -1],
  [9, 7, 8, 9, 5, 7, 10, 1, 2, -1],
  [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1],
  [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1],
  [2, 10, 5, 2, 5, 3, 3, 5, 7, -1],
  [7, 9, 5, 7, 8, 9, 3, 11, 2, -1],
  [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1],
  [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1],
  [11, 2, 1, 11, 1, 7, 7, 1, 5, -1],
  [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1],
  [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1],
  [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1],
  [11, 10, 5, 7, 11, 5, -1],
  [10, 6, 5, -1],
  [0, 8, 3, 5, 10, 6, -1],
  [9, 0, 1, 5, 10, 6, -1],
  [1, 8, 3, 1, 9, 8, 5, 10, 6, -1],
  [1, 6, 5, 2, 6, 1, -1],
  [1, 6, 5, 1, 2, 6, 3, 0, 8, -1],
  [9, 6, 5, 9, 0, 6, 0, 2, 6, -1],
  [5, 9, 0, 5, 0, 6, 2, 6, 0, 3, 8, 2, 8, 6, 2, -1],
  [2, 3, 11, 10, 6, 5, -1],
  [11, 0, 8, 11, 2, 0, 10, 6, 5, -1],
  [0, 1, 9, 2, 3, 11, 5, 10, 6, -1],
  [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1],
  [6, 3, 11, 6, 5, 3, 5, 1, 3, -1],
  [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1],
  [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1],
  [6, 5, 9, 6, 9, 11, 11, 9, 8, -1],
  [5, 10, 6, 4, 7, 8, -1],
  [4, 3, 0, 4, 7, 3, 6, 5, 10, -1],
  [1, 9, 0, 5, 10, 6, 8, 4, 7, -1],
  [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1],
  [6, 1, 2, 6, 5, 1, 4, 7, 8, -1],
  [1, 2, 6, 1, 6, 5, 0, 4, 3, 4, 7, 3, -1],
  [7, 8, 4, 9, 6, 5, 9, 0, 6, 0, 2, 6, -1],
  [7, 3, 2, 7, 2, 5, 7, 5, 4, 6, 5, 2, -1],
  [2, 3, 11, 5, 10, 6, 7, 8, 4, -1],
  [10, 6, 5, 2, 4, 11, 2, 0, 4, 7, 11, 4, -1],
  [4, 7, 8, 9, 0, 1, 5, 10, 6, 2, 3, 11, -1],
  [4, 7, 8, 6, 5, 10, 9, 1, 11, 1, 2, 11, -1],
  [3, 11, 6, 3, 6, 1, 1, 6, 5, 4, 7, 8, -1],
  [4, 7, 8, 1, 11, 6, 1, 6, 5, 1, 0, 11, 0, 8, 11, -1],
  [0, 3, 11, 0, 11, 9, 9, 11, 6, 9, 6, 5, 8, 4, 7, -1],
  [7, 8, 4, 9, 11, 8, 9, 6, 11, 9, 5, 6, -1],
  [7, 1, 4, 1, 2, 4, 2, 6, 4, -1],
  [3, 0, 8, 7, 1, 4, 1, 2, 4, 2, 6, 4, -1],
  [0, 2, 9, 2, 4, 9, 2, 6, 4, 4, 7, 9, -1],
  [8, 3, 2, 8, 2, 4, 4, 2, 6, 7, 8, 4, -1],
  [10, 1, 7, 10, 7, 6, 4, 3, 8, -1],
  [10, 1, 7, 10, 7, 6, 0, 8, 4, -1],
  [9, 2, 10, 9, 7, 2, 9, 4, 7, 7, 6, 2, -1],
  [8, 4, 7, 10, 9, 2, 9, 6, 2, 9, 5, 6, -1],
  [11, 2, 1, 11, 1, 6, 6, 1, 4, 6, 4, 7, -1],
  [0, 8, 11, 0, 11, 2, 1, 4, 7, 1, 6, 4, -1],
  [0, 1, 9, 11, 2, 6, 11, 6, 7, 7, 6, 4, -1],
  [8, 11, 2, 8, 2, 9, 9, 2, 1, 7, 4, 6, -1],
  [3, 10, 1, 3, 11, 10, 7, 6, 4, -1],
  [0, 8, 10, 0, 10, 1, 8, 11, 10, 7, 6, 4, -1],
  [3, 11, 10, 3, 10, 0, 0, 10, 9, 7, 6, 4, -1],
  [4, 7, 6, 8, 11, 10, 8, 10, 9, -1],
  [9, 7, 8, 9, 6, 7, 6, 10, 7, -1],
  [8, 9, 6, 8, 6, 7, 10, 7, 6, 0, 3, 8, -1],
  [0, 1, 7, 0, 7, 8, 1, 6, 7, 1, 10, 6, -1],
  [1, 10, 6, 1, 6, 3, 3, 6, 7, -1],
  [9, 7, 8, 9, 6, 7, 6, 10, 7, 0, 1, 2, -1],
  [10, 1, 2, 0, 8, 9, 8, 6, 9, 8, 7, 6, -1],
  [2, 8, 0, 2, 6, 8, 6, 7, 8, 2, 10, 6, -1],
  [10, 6, 2, 6, 7, 2, 7, 3, 2, -1],
  [11, 2, 3, 9, 7, 8, 9, 6, 7, 6, 10, 7, -1],
  [0, 8, 9, 8, 6, 9, 8, 7, 6, 11, 2, 0, 2, 6, 0, -1],
  [3, 11, 2, 0, 1, 7, 0, 7, 8, 1, 6, 7, 1, 10, 6, -1],
  [1, 10, 6, 1, 6, 2, 2, 6, 11, 11, 6, 7, -1],
  [9, 8, 7, 9, 7, 6, 6, 10, 9, 0, 1, 3, 1, 11, 3, -1],
  [6, 10, 1, 6, 1, 11, 11, 1, 0, 11, 0, 8, 8, 7, 6, -1],
  [0, 3, 11, 0, 11, 9, 9, 11, 6, 9, 6, 10, 7, 8, 6, -1],
  [11, 10, 6, 7, 11, 6, 8, 9, 7, -1],
  [7, 6, 11, -1]
];

// Reusable corner indices for each of the 12 edges
const EDGE_CORNERS = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

// Local offsets for each corner [dx, dy, dz]
const CORNER_OFFSETS = [
  [0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1],
  [0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1],
];

export interface MarchingCubesDomain {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
  depths: number[]; // real depths in meters
  boxWidth: number;
  boxDepth: number;
  boxHeight: number;
}

/**
 * Extracts a 3D isosurface BufferGeometry from a 3D scalar field [depth, lat, lon].
 */
export function extractIsosurface(
  volume3D: number[][][], // [depthIdx][latIdx][lonIdx]
  threshold: number,
  domain: MarchingCubesDomain
): THREE.BufferGeometry {
  const nDepth = volume3D.length;
  const nLat = volume3D[0].length;
  const nLon = volume3D[0][0].length;

  const { boxWidth, boxDepth, boxHeight, depths } = domain;
  const maxDepthM = depths[depths.length - 1] || 1000;

  const positions: number[] = [];

  // Corner world coordinate helpers
  const getCornerPos = (ix: number, iy: number, iz: number): [number, number, number] => {
    // ix: lon (0 to nLon-1) -> world X [-boxWidth/2, boxWidth/2]
    const x = -boxWidth / 2 + (ix / (nLon - 1)) * boxWidth;
    // iy: depth (0 to nDepth-1) -> world Y [0 to -boxHeight]
    const depthVal = depths[iy] ?? (iy / (nDepth - 1)) * maxDepthM;
    const y = -(depthVal / maxDepthM) * boxHeight;
    // iz: lat (0 to nLat-1) -> world Z [boxDepth/2 to -boxDepth/2]
    const z = boxDepth / 2 - (iz / (nLat - 1)) * boxDepth;
    return [x, y, z];
  };

  // Iterate over each voxel cube
  for (let iy = 0; iy < nDepth - 1; iy++) {
    for (let iz = 0; iz < nLat - 1; iz++) {
      for (let ix = 0; ix < nLon - 1; ix++) {
        // Sample the 8 corners
        const cVals = [
          volume3D[iy][iz][ix],
          volume3D[iy][iz][ix + 1],
          volume3D[iy][iz + 1][ix + 1],
          volume3D[iy][iz + 1][ix],
          volume3D[iy + 1][iz][ix],
          volume3D[iy + 1][iz][ix + 1],
          volume3D[iy + 1][iz + 1][ix + 1],
          volume3D[iy + 1][iz + 1][ix],
        ];

        // Determine cube configuration index (0 to 255)
        let cubeIndex = 0;
        for (let i = 0; i < 8; i++) {
          if (cVals[i] < threshold) {
            cubeIndex |= 1 << i;
          }
        }

        // Entirely inside or outside the surface
        if (EDGE_TABLE[cubeIndex] === 0) continue;

        // Compute vertex positions along the 12 edges
        const edgeVertices: [number, number, number][] = new Array(12);

        for (let e = 0; e < 12; e++) {
          if ((EDGE_TABLE[cubeIndex] & (1 << e)) !== 0) {
            const [c1, c2] = EDGE_CORNERS[e];
            const v1 = cVals[c1];
            const v2 = cVals[c2];

            // Linear interpolation fraction
            let mu = 0.5;
            if (Math.abs(v2 - v1) > 1e-6) {
              mu = (threshold - v1) / (v2 - v1);
              mu = Math.max(0, Math.min(1, mu));
            }

            const off1 = CORNER_OFFSETS[c1];
            const off2 = CORNER_OFFSETS[c2];

            const p1 = getCornerPos(ix + off1[0], iy + off1[1], iz + off1[2]);
            const p2 = getCornerPos(ix + off2[0], iy + off2[1], iz + off2[2]);

            edgeVertices[e] = [
              p1[0] + mu * (p2[0] - p1[0]),
              p1[1] + mu * (p2[1] - p1[1]),
              p1[2] + mu * (p2[2] - p1[2]),
            ];
          }
        }

        // Add triangles using triTable
        const tris = TRI_TABLE[cubeIndex];
        if (!tris) continue;

        for (let t = 0; t < tris.length && tris[t] !== -1; t += 3) {
          const e0 = tris[t];
          const e1 = tris[t + 1];
          const e2 = tris[t + 2];

          const p0 = edgeVertices[e0];
          const p1 = edgeVertices[e1];
          const p2 = edgeVertices[e2];

          if (p0 && p1 && p2) {
            positions.push(p0[0], p0[1], p0[2]);
            positions.push(p1[0], p1[1], p1[2]);
            positions.push(p2[0], p2[1], p2[2]);
          }
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  if (positions.length > 0) {
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
  }

  return geometry;
}
