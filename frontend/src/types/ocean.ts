/**
 * Frontend domain and visualization types.
 */

import { DatasetMetadata, ObservationMetadata } from './api';

export type ScaleType = 'linear' | 'log';

export interface ColorPalette {
  id: string;
  name: string;
  category: 'diverging' | 'sequential' | 'oceanographic';
  stops: string[]; // CSS gradient hex colors
}

export interface VariableConfig {
  id: string;
  label: string;
  unit: string;
  defaultMin: number;
  defaultMax: number;
  palette: string;
  scaleType: ScaleType;
  step: number;
  description: string;
}

export interface OceanViewState {
  // Dimension coordinates
  selectedVariable: string;
  selectedTimeIndex: number;
  selectedDepth: number; // in meters (positive down: 0 = surface)
  
  // Color scale
  colorScale: string;
  colorMin: number;
  colorMax: number;
  scaleType: ScaleType;
  
  // 3D Rendering & Layers
  verticalExaggeration: number; // 1x to 25x
  showOceanVolume: boolean;
  showCurrents: boolean;
  showArgo: boolean;
  showGliders: boolean;
  showGrid: boolean;
  showBathymetry: boolean;
  
  // Active selection
  selectedObservation: ObservationMetadata | null;
  
  // Dataset & UI
  dataset: DatasetMetadata | null;
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;
  playbackSpeedMs: number;
  activeTab: 'layers' | 'metadata' | 'observations';
  sidebarOpen: boolean;
  inspectorOpen: boolean;
}
