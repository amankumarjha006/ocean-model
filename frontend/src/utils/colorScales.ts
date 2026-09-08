import { ColorPalette, ScaleType } from '../types/ocean';

/**
 * Standard Oceanographic & Scientific Color Palettes
 * Formulated with professional oceanographic tones (Zero indigo or violet).
 */
export const COLOR_PALETTES: Record<string, ColorPalette> = {
  thermal: {
    id: 'thermal',
    name: 'Thermal (Temperature)',
    category: 'oceanographic',
    stops: ['#0f1d38', '#143865', '#126180', '#0d857b', '#26a96c', '#72c153', '#c6d63c', '#f59e0b', '#ea580c', '#dc2626'],
  },
  haline: {
    id: 'haline',
    name: 'Haline (Salinity)',
    category: 'oceanographic',
    stops: ['#082f49', '#0369a1', '#0891b2', '#0d9488', '#10b981', '#84cc16', '#eab308', '#d97706'],
  },
  algae: {
    id: 'algae',
    name: 'Algae (Chlorophyll)',
    category: 'oceanographic',
    stops: ['#022c22', '#064e3b', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#fef08a'],
  },
  coolwarm: {
    id: 'coolwarm',
    name: 'Cool-Warm (Velocity / Anomaly)',
    category: 'diverging',
    stops: ['#0f4c81', '#2d74b2', '#589fd6', '#98c5e9', '#e8eef2', '#f19e75', '#de6245', '#bd2d2b', '#8c0e14'],
  },
  speed: {
    id: 'speed',
    name: 'Current Speed & Energy',
    category: 'sequential',
    stops: ['#082f49', '#0e7490', '#06b6d4', '#10b981', '#84cc16', '#f59e0b', '#ea580c', '#dc2626'],
  },
  deepocean: {
    id: 'deepocean',
    name: 'Deep Ocean Bathymetry',
    category: 'oceanographic',
    stops: ['#020617', '#082f49', '#075985', '#0284c7', '#38bdf8', '#7dd3fc', '#bae6fd'],
  },
};

export interface ColorScaleConfig {
  palette: string;
  min: number;
  max: number;
  scaleType: ScaleType;
  stops: string[];
}

export function getColorScaleConfig(
  paletteId: string,
  min: number,
  max: number,
  scaleType: ScaleType = 'linear'
): ColorScaleConfig {
  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES.thermal;
  return {
    palette: palette.id,
    min,
    max,
    scaleType,
    stops: palette.stops,
  };
}

export function createCssGradient(paletteId: string): string {
  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES.thermal;
  return `linear-gradient(to right, ${palette.stops.join(', ')})`;
}

/**
 * Maps a scalar value into normalized [0, 1] range using either linear or log scale.
 */
export function normalizeValue(val: number, min: number, max: number, scaleType: ScaleType = 'linear'): number {
  if (scaleType === 'log') {
    const safeMin = Math.max(min, 0.0001);
    const safeVal = Math.max(val, safeMin);
    const safeMax = Math.max(max, safeMin + 0.0001);
    const logVal = Math.log10(safeVal);
    const logMin = Math.log10(safeMin);
    const logMax = Math.log10(safeMax);
    return Math.min(Math.max((logVal - logMin) / (logMax - logMin), 0), 1);
  }
  return Math.min(Math.max((val - min) / (max - min || 1), 0), 1);
}
