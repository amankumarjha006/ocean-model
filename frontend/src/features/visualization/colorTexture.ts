import * as THREE from 'three';

export interface ColorStop {
  stop: number;
  r: number;
  g: number;
  b: number;
}

export const COLOR_PALETTES: Record<string, ColorStop[]> = {
  thermal: [
    { stop: 0.0, r: 30, g: 58, b: 138 },    // Deep visible blue (was rgb(15,23,90) / too dark)
    { stop: 0.2, r: 14, g: 116, b: 144 },  // Ocean teal
    { stop: 0.4, r: 16, g: 185, b: 129 },  // Emerald green
    { stop: 0.6, r: 234, g: 179, b: 8 },   // Amber
    { stop: 0.8, r: 249, g: 115, b: 22 },  // Warm orange
    { stop: 1.0, r: 225, g: 29, b: 72 },   // Tropical thermal red
  ],
  haline: [
    { stop: 0.0, r: 12, g: 74, b: 110 },   // Fresh river runoff blue (was rgb(8,47,73))
    { stop: 0.25, r: 13, g: 148, b: 136 }, // Low salinity cyan
    { stop: 0.5, r: 52, g: 211, b: 153 },  // Baseline salinity mint
    { stop: 0.75, r: 250, g: 204, b: 21 }, // High salinity sand
    { stop: 1.0, r: 217, g: 119, b: 6 },   // Hyper-saline Arabian Sea amber
  ],
  algae: [
    { stop: 0.0, r: 2, g: 44, b: 34 },     // Oligotrophic dark waters (was rgb(15,23,42))
    { stop: 0.15, r: 6, g: 78, b: 59 },    // Low bloom forest
    { stop: 0.4, r: 16, g: 185, b: 129 },  // Active phytoplankton green
    { stop: 0.7, r: 132, g: 204, b: 22 },  // Subsurface chlorophyll max (SCM) lime
    { stop: 1.0, r: 250, g: 204, b: 21 },  // Dense coastal bloom chartreuse
  ],
  coolwarm: [
    { stop: 0.0, r: 37, g: 99, b: 235 },   // Negative anomaly blue
    { stop: 0.35, r: 147, g: 197, b: 253 },// Weak negative
    { stop: 0.5, r: 241, g: 245, b: 249 }, // Neutral white
    { stop: 0.65, r: 252, g: 165, b: 165 },// Weak positive
    { stop: 1.0, r: 220, g: 38, b: 38 },   // Positive anomaly red
  ],
  speed: [
    { stop: 0.0, r: 49, g: 46, b: 129 },   // Stagnant / calm deep indigo (was rgb(30,27,75))
    { stop: 0.2, r: 6, g: 182, b: 212 },   // Light drift cyan
    { stop: 0.45, r: 16, g: 185, b: 129 }, // Moderate current green
    { stop: 0.7, r: 245, g: 158, b: 11 },  // Energetic jet amber
    { stop: 1.0, r: 239, g: 68, b: 68 },   // Intense boundary current red
  ],
  viridis: [
    { stop: 0.0, r: 68, g: 1, b: 84 },
    { stop: 0.25, r: 59, g: 82, b: 139 },
    { stop: 0.5, r: 33, g: 145, b: 140 },
    { stop: 0.75, r: 94, g: 201, b: 98 },
    { stop: 1.0, r: 253, g: 231, b: 37 },
  ],
};

/**
 * Samples RGBA values from a colormap palette given a normalized [0, 1] scalar.
 */
export function samplePalette(paletteName: string, t: number): [number, number, number] {
  const stops = COLOR_PALETTES[paletteName] || COLOR_PALETTES.thermal;
  const clampedT = Math.max(0, Math.min(1, t));

  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    if (clampedT >= s1.stop && clampedT <= s2.stop) {
      const span = s2.stop - s1.stop;
      const factor = span === 0 ? 0 : (clampedT - s1.stop) / span;
      const r = Math.round(s1.r + factor * (s2.r - s1.r));
      const g = Math.round(s1.g + factor * (s2.g - s1.g));
      const b = Math.round(s1.b + factor * (s2.b - s1.b));
      return [r, g, b];
    }
  }

  const last = stops[stops.length - 1];
  return [last.r, last.g, last.b];
}

/**
 * Converts any ocean scalar value to normalized [0, 1] position given range & scale type.
 */
export function normalizeValue(
  value: number,
  minVal: number,
  maxVal: number,
  scaleType: string = 'linear'
): number {
  if (minVal >= maxVal) return 0.5;

  if (scaleType === 'log') {
    const safeVal = Math.max(1e-4, value);
    const safeMin = Math.max(1e-4, minVal);
    const safeMax = Math.max(safeMin * 1.01, maxVal);
    const logVal = Math.log10(safeVal);
    const logMin = Math.log10(safeMin);
    const logMax = Math.log10(safeMax);
    return Math.max(0, Math.min(1, (logVal - logMin) / (logMax - logMin)));
  }

  return Math.max(0, Math.min(1, (value - minVal) / (maxVal - minVal)));
}

/**
 * Returns RGB hex string for a given value and colormap range.
 */
export function getColormapHex(
  value: number,
  minVal: number,
  maxVal: number,
  palette: string = 'thermal',
  scaleType: string = 'linear'
): string {
  const t = normalizeValue(value, minVal, maxVal, scaleType);
  const [r, g, b] = samplePalette(palette, t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Creates a THREE.DataTexture from a 2D scalar array [height(lat)][width(lon)].
 * Uses RGBA Uint8Array with bilinear filtering for seamless GPU rendering.
 */
export function createDataTexture(
  data2D: number[][],
  minVal: number,
  maxVal: number,
  palette: string = 'thermal',
  scaleType: string = 'linear',
  alpha: number = 255
): THREE.DataTexture {
  const height = data2D.length; // latitudes (e.g. 64)
  const width = data2D[0].length; // longitudes (e.g. 96)

  const size = width * height;
  const rgbaData = new Uint8Array(4 * size);

  for (let y = 0; y < height; y++) {
    // Invert row index so latitude 0 is at bottom, latitude 30 is at top in texture coordinates
    const row = height - 1 - y;
    const rowData = data2D[row];

    for (let x = 0; x < width; x++) {
      const val = rowData[x];
      const t = normalizeValue(val, minVal, maxVal, scaleType);
      const [r, g, b] = samplePalette(palette, t);

      const offset = (y * width + x) * 4;
      rgbaData[offset] = r;
      rgbaData[offset + 1] = g;
      rgbaData[offset + 2] = b;
      rgbaData[offset + 3] = alpha;
    }
  }

  const texture = new THREE.DataTexture(
    rgbaData,
    width,
    height,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return texture;
}
