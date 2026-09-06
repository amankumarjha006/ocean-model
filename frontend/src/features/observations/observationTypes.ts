import { ObservationMetadata } from '../../types/api';

export interface ObservationVisualMarker {
  id: string;
  type: 'argo' | 'glider' | 'mooring';
  name: string;
  position: [number, number, number]; // [x, y, z] in viewport normalized space
  coordinates: {
    lat: number;
    lon: number;
    depth: number;
  };
  color: string;
  metadata: ObservationMetadata;
}

export const OBSERVATION_TYPE_COLORS: Record<string, string> = {
  argo: '#f59e0b',    // Amber / yellow float
  glider: '#10b981',  // Emerald green autonomous glider
  mooring: '#ec4899', // Pink moored buoy
  drifter: '#8b5cf6', // Purple surface drifter
};
