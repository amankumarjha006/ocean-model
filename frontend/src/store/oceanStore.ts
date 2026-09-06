import { create } from 'zustand';
import { DatasetMetadata, ObservationMetadata, SliceResponse, VolumeResponse } from '../types/api';
import { ScaleType } from '../types/ocean';
import { resolveVariableConfig } from '../features/ocean/variableConfig';

export type VizMode = 'slice' | 'volume' | 'currents' | 'isosurface';
export type CameraPreset = 'default' | 'top' | 'side';

export interface HoveredOceanPoint {
  lat: number;
  lon: number;
  depth: number;
  val: number;
  varName: string;
  units: string;
  x: number;
  y: number;
}

export interface OceanStoreState {
  // Visualization Mode
  vizMode: VizMode;
  cameraPreset: CameraPreset;

  // Domain variables & slicing coordinates
  selectedVariable: string;
  selectedTimeIndex: number;
  selectedDepth: number; // in meters (0 = surface)

  // Color mapping
  colorScale: string;
  colorMin: number;
  colorMax: number;
  scaleType: ScaleType;

  // 3D Rendering layers
  verticalExaggeration: number;
  showOceanVolume: boolean;
  showCurrents: boolean;
  showArgo: boolean;
  showGliders: boolean;
  showGrid: boolean;
  showBathymetry: boolean;

  // Mode-specific parameters
  isosurfaceThreshold: number;
  volumeLayerCount: number;
  volumeOpacity: number;
  currentDensity: number;
  currentSpeedScale: number;
  currentOpacity: number;

  // Interactive Hover Inspection
  hoveredPoint: HoveredOceanPoint | null;

  // Selected in-situ observation
  selectedObservation: ObservationMetadata | null;

  // Dataset metadata & live backend data
  dataset: DatasetMetadata | null;
  isLoading: boolean;
  error: string | null;
  backendOnline: boolean;

  // 4D Timeline animation
  isPlaying: boolean;
  playbackSpeedMs: number;

  // Scenario
  selectedScenario: string;
  currentSlice: SliceResponse | null;
  currentProfile: any | null;
  volumeData: VolumeResponse | null;
  uSlice: SliceResponse | null;
  vSlice: SliceResponse | null;

  // Layout UI
  sidebarOpen: boolean;
  inspectorOpen: boolean;

  // Actions
  setVizMode: (mode: VizMode) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setSelectedScenario: (scenario: string) => void;
  setCurrentSlice: (slice: SliceResponse | null) => void;
  setCurrentProfile: (profile: any | null) => void;
  setVolumeData: (volume: VolumeResponse | null) => void;
  setUSlice: (slice: SliceResponse | null) => void;
  setVSlice: (slice: SliceResponse | null) => void;
  setHoveredPoint: (point: HoveredOceanPoint | null) => void;
  setIsosurfaceThreshold: (threshold: number) => void;
  setVolumeLayerCount: (count: number) => void;
  setVolumeOpacity: (opacity: number) => void;
  setCurrentDensity: (density: number) => void;
  setCurrentSpeedScale: (scale: number) => void;
  setCurrentOpacity: (opacity: number) => void;
  setDataset: (dataset: DatasetMetadata) => void;
  setBackendOnline: (online: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedVariable: (varName: string) => void;
  setSelectedTimeIndex: (index: number) => void;
  setSelectedDepth: (depth: number) => void;
  setColorScale: (palette: string) => void;
  setColorRange: (min: number, max: number) => void;
  setScaleType: (type: ScaleType) => void;
  setVerticalExaggeration: (val: number) => void;
  toggleShowOceanVolume: () => void;
  toggleShowCurrents: () => void;
  toggleShowArgo: () => void;
  toggleShowGliders: () => void;
  toggleShowGrid: () => void;
  toggleShowBathymetry: () => void;
  setSelectedObservation: (obs: ObservationMetadata | null) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayback: () => void;
  stepTime: (direction: 1 | -1) => void;
  toggleSidebar: () => void;
  toggleInspector: () => void;
  resetView: () => void;
}

export const useOceanStore = create<OceanStoreState>((set, get) => ({
  // Default values
  vizMode: 'slice',
  cameraPreset: 'default',

  selectedVariable: 'temperature',
  selectedTimeIndex: 0,
  selectedDepth: 0.0,

  colorScale: 'thermal',
  colorMin: 5.0,
  colorMax: 30.0,
  scaleType: 'linear',

  verticalExaggeration: 5.0,
  showOceanVolume: true,
  showCurrents: true,
  showArgo: true,
  showGliders: true,
  showGrid: true,
  showBathymetry: true,

  isosurfaceThreshold: 22.0,
  volumeLayerCount: 10,
  volumeOpacity: 0.4,
  currentDensity: 2,
  currentSpeedScale: 1.2,
  currentOpacity: 0.85,

  hoveredPoint: null,
  selectedObservation: null,

  dataset: null,
  isLoading: true,
  error: null,
  backendOnline: false,

  isPlaying: false,
  playbackSpeedMs: 1200,

  selectedScenario: 'normal',
  currentSlice: null,
  currentProfile: null,
  volumeData: null,
  uSlice: null,
  vSlice: null,

  sidebarOpen: true,
  inspectorOpen: true,

  setVizMode: (vizMode: VizMode) => set({ vizMode }),
  setCameraPreset: (cameraPreset: CameraPreset) => set({ cameraPreset }),
  setSelectedScenario: (selectedScenario: string) => set({ selectedScenario }),
  setCurrentSlice: (currentSlice: SliceResponse | null) => set({ currentSlice }),
  setCurrentProfile: (currentProfile: any | null) => set({ currentProfile }),
  setVolumeData: (volumeData: VolumeResponse | null) => set({ volumeData }),
  setUSlice: (uSlice: SliceResponse | null) => set({ uSlice }),
  setVSlice: (vSlice: SliceResponse | null) => set({ vSlice }),
  setHoveredPoint: (hoveredPoint: HoveredOceanPoint | null) => set({ hoveredPoint }),
  setIsosurfaceThreshold: (isosurfaceThreshold: number) => set({ isosurfaceThreshold }),
  setVolumeLayerCount: (volumeLayerCount: number) => set({ volumeLayerCount }),
  setVolumeOpacity: (volumeOpacity: number) => set({ volumeOpacity }),
  setCurrentDensity: (currentDensity: number) => set({ currentDensity }),
  setCurrentSpeedScale: (currentSpeedScale: number) => set({ currentSpeedScale }),
  setCurrentOpacity: (currentOpacity: number) => set({ currentOpacity }),

  setDataset: (dataset: DatasetMetadata) => {
    const currentVar = get().selectedVariable;
    const varKeys = Object.keys(dataset.variables);
    const targetVar = varKeys.includes(currentVar) ? currentVar : varKeys[0] || 'temperature';
    const varMeta = dataset.variables[targetVar];
    const config = resolveVariableConfig(targetVar, varMeta);

    set({
      dataset,
      selectedVariable: targetVar,
      colorScale: config.palette,
      colorMin: config.defaultMin,
      colorMax: config.defaultMax,
      scaleType: config.scaleType,
      selectedDepth: dataset.coordinates.depth.values[0] ?? 0.0,
      isosurfaceThreshold: Math.round(((config.defaultMin + config.defaultMax) / 2) * 10) / 10,
      isLoading: false,
      error: null,
    });
  },

  setBackendOnline: (backendOnline) => set({ backendOnline }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  setSelectedVariable: (varName: string) => {
    const { dataset } = get();
    const varMeta = dataset?.variables[varName];
    const config = resolveVariableConfig(varName, varMeta);
    const midThreshold = Math.round(((config.defaultMin + config.defaultMax) / 2) * 10) / 10;

    set({
      selectedVariable: varName,
      colorScale: config.palette,
      colorMin: config.defaultMin,
      colorMax: config.defaultMax,
      scaleType: config.scaleType,
      isosurfaceThreshold: midThreshold,
    });
  },

  setSelectedTimeIndex: (index: number) => {
    const total = get().dataset?.coordinates.time.count || 10;
    const clamped = Math.max(0, Math.min(index, total - 1));
    set({ selectedTimeIndex: clamped });
  },

  setSelectedDepth: (depth: number) => set({ selectedDepth: depth }),

  setColorScale: (colorScale: string) => set({ colorScale }),

  setColorRange: (colorMin: number, colorMax: number) => set({ colorMin, colorMax }),

  setScaleType: (scaleType: ScaleType) => set({ scaleType }),

  setVerticalExaggeration: (verticalExaggeration: number) => set({ verticalExaggeration }),

  toggleShowOceanVolume: () => set((state) => ({ showOceanVolume: !state.showOceanVolume })),
  toggleShowCurrents: () => set((state) => ({ showCurrents: !state.showCurrents })),
  toggleShowArgo: () => set((state) => ({ showArgo: !state.showArgo })),
  toggleShowGliders: () => set((state) => ({ showGliders: !state.showGliders })),
  toggleShowGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleShowBathymetry: () => set((state) => ({ showBathymetry: !state.showBathymetry })),

  setSelectedObservation: (obs: ObservationMetadata | null) => set({ selectedObservation: obs }),

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

  stepTime: (direction: 1 | -1) => {
    const { selectedTimeIndex, dataset } = get();
    const total = dataset?.coordinates.time.count || 10;
    let next = selectedTimeIndex + direction;
    if (next < 0) next = total - 1;
    if (next >= total) next = 0;
    set({ selectedTimeIndex: next });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),

  resetView: () =>
    set({
      selectedDepth: 0.0,
      selectedTimeIndex: 0,
      verticalExaggeration: 5.0,
      vizMode: 'slice',
      cameraPreset: 'default',
      showOceanVolume: true,
      showCurrents: true,
      showArgo: true,
      showGliders: true,
      showGrid: true,
      showBathymetry: true,
      selectedObservation: null,
      hoveredPoint: null,
    }),
}));

