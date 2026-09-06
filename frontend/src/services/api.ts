import {
  DatasetMetadata,
  HealthResponse,
  SliceResponse,
  ProfileResponse,
  VolumeResponse,
  ScenarioInfo,
} from '../types/api';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

export async function fetchScenarios(): Promise<ScenarioInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/dataset/scenarios`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Failed to fetch scenarios:', err);
  }
  return [
    { name: 'normal', description: 'Standard baseline with balanced eddies' },
    { name: 'warm_eddy', description: 'Intensified warm anticyclonic eddy' },
    { name: 'cold_eddy', description: 'Intensified cold cyclonic eddy' },
    { name: 'strong_currents', description: 'Energetic surface circulation' },
  ];
}

export async function fetchDatasetMetadata(scenario: string = 'normal'): Promise<DatasetMetadata> {
  const url = `${API_BASE}/dataset?scenario=${encodeURIComponent(scenario)}`;
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset metadata: HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn(`Backend /api/dataset unreachable via proxy, checking fallback...`, err);
    try {
      const directResponse = await fetch(`http://127.0.0.1:8000${url}`);
      if (directResponse.ok) {
        return await directResponse.json();
      }
    } catch {
      // ignore
    }
    throw err;
  }
}

export async function fetchSlice(
  variable: string,
  timeIndex: number = 0,
  depthIndex: number = 0,
  scenario: string = 'normal'
): Promise<SliceResponse> {
  const params = new URLSearchParams({
    variable,
    time_index: timeIndex.toString(),
    depth_index: depthIndex.toString(),
    scenario,
  });
  const response = await fetch(`${API_BASE}/data/slice?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch slice data: HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchProfile(
  latIndex: number,
  lonIndex: number,
  timeIndex: number = 0,
  variable: string = 'temperature',
  scenario: string = 'normal'
): Promise<ProfileResponse> {
  const params = new URLSearchParams({
    latitude_index: latIndex.toString(),
    longitude_index: lonIndex.toString(),
    time_index: timeIndex.toString(),
    variable,
    scenario,
  });
  const response = await fetch(`${API_BASE}/data/profile?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchVolume(
  variable: string = 'temperature',
  timeIndex: number = 0,
  scenario: string = 'normal',
  numDepths: number = 12
): Promise<VolumeResponse> {
  const params = new URLSearchParams({
    variable,
    time_index: timeIndex.toString(),
    scenario,
    num_depths: numDepths.toString(),
  });
  const response = await fetch(`${API_BASE}/data/volume?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch volume data: HTTP ${response.status}`);
  }
  return response.json();
}

