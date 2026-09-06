/**
 * TypeScript definitions mapping to backend FastAPI Pydantic schemas.
 */

export interface TimeCoordinate {
  units: string;
  calendar: string;
  values: string[];
  start: string;
  end: string;
  step: string;
  count: number;
}

export interface DepthCoordinate {
  units: string;
  positive: string;
  standard_name: string;
  values: number[];
  min_depth: number;
  max_depth: number;
  count: number;
}

export interface SpatialCoordinate {
  units: string;
  standard_name: string;
  min_val: number;
  max_val: number;
  step: number;
  count: number;
}

export interface CoordinateMetadata {
  time: TimeCoordinate;
  depth: DepthCoordinate;
  latitude: SpatialCoordinate;
  longitude: SpatialCoordinate;
}

export interface VariableMetadata {
  name: string;
  display_name: string;
  units: string;
  standard_name: string;
  dimensions: string[];
  description: string;
  valid_min?: number;
  valid_max?: number;
  default_palette: string;
  scale_type: 'linear' | 'log';
  fill_value?: number;
}

export interface ObservationMetadata {
  id: string;
  platform_type: 'argo' | 'glider' | 'mooring' | 'drifter' | string;
  platform_name: string;
  institution: string;
  variables_measured: string[];
  time_range: [string, string];
  depth_range_m: [number, number];
  spatial_extent: [number, number, number, number]; // [min_lon, min_lat, max_lon, max_lat]
  profile_count: number;
  status: 'active' | 'completed' | 'inactive' | string;
}

export interface SpatialBounds {
  min_latitude: number;
  max_latitude: number;
  min_longitude: number;
  max_longitude: number;
}

export interface TemporalBounds {
  start_time: string;
  end_time: string;
  time_steps_count: number;
}

export interface DatasetMetadata {
  id: string;
  title: string;
  institution: string;
  conventions: string;
  source_model: string;
  summary: string;
  spatial_bounds: SpatialBounds;
  temporal_bounds: TemporalBounds;
  coordinates: CoordinateMetadata;
  variables: Record<string, VariableMetadata>;
  observations: ObservationMetadata[];
  version: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  service: string;
}

export interface ScenarioInfo {
  name: string;
  description: string;
}

export interface SliceResponse {
  variable: string;
  display_name: string;
  units: string;
  scenario: string;
  time_index: number;
  timestamp: string;
  depth_index: number;
  depth_m: number;
  shape: [number, number]; // [64, 96]
  latitudes: number[];
  longitudes: number[];
  min: number;
  max: number;
  mean: number;
  data: number[][]; // 2D array [64][96]
}

export interface ProfileResponse {
  variable: string;
  display_name: string;
  units: string;
  scenario: string;
  time_index: number;
  timestamp: string;
  latitude_index: number;
  latitude: number;
  longitude_index: number;
  longitude: number;
  depths: number[];
  values: number[];
  min: number;
  max: number;
}

export interface VolumeResponse {
  variable: string;
  display_name: string;
  units: string;
  scenario: string;
  time_index: number;
  timestamp: string;
  num_depths: number;
  depth_indices: number[];
  depths: number[];
  shape: [number, number, number]; // [num_depths, 64, 96]
  latitudes: number[];
  longitudes: number[];
  min: number;
  max: number;
  mean: number;
  data: number[][][]; // [depth][lat][lon]
}

