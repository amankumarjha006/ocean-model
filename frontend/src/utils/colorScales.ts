import { ColorPalette, ScaleType } from '../types/ocean';

/**
 * Standard Oceanographic & Scientific Color Palettes
 * (Thermal/Inferno, Haline/Viridis, Algae/OceanBio, Velocity/CoolWarm, Speed/Plasma, DeepOcean)
 */
export const COLOR_PALETTES: Record<string, ColorPalette> = {
  thermal: {
    id: 'thermal',
    name: 'Thermal (Temperature)',
    category: 'oceanographic',
    stops: ['#03071e', '#370617', '#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307', '#ffba08'],
  },
  haline: {
    id: 'haline',
    name: 'Haline (Salinity)',
    category: 'oceanographic',
    stops: ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'],
  },
  algae: {
    id: 'algae',
    name: 'Algae (Chlorophyll)',
    category: 'oceanographic',
    stops: ['#081c15', '#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#f1faee'],
  },
  coolwarm: {
    id: 'coolwarm',
    name: 'Cool-Warm (Velocity / Anomaly)',
    category: 'diverging',
    stops: ['#3b4cc0', '#688aef', '#99baff', '#c8d8f7', '#e2e2e2', '#f5c4ad', '#ea8a72', '#cb4942', '#b40426'],
  },
  speed: {
    id: 'speed',
    name: 'Plasma (Speed / Energy)',
    category: 'sequential',
    stops: ['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'],
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
