import { VariableConfig } from '../../types/ocean';
import { VariableMetadata } from '../../types/api';

/**
 * Generic canonical variable configuration registry.
 * Provides sensible visualization defaults (units, min, max, colormap, scale type)
 * while remaining fully dynamic for arbitrary variables returned by the backend.
 */
export const VARIABLE_CONFIG_REGISTRY: Record<string, VariableConfig> = {
  temperature: {
    id: 'temperature',
    label: 'Sea Water Temperature',
    unit: '°C',
    defaultMin: 5.0,
    defaultMax: 30.0,
    palette: 'thermal',
    scaleType: 'linear',
    step: 0.1,
    description: 'Potential temperature of sea water across depth strata.',
  },
  salinity: {
    id: 'salinity',
    label: 'Sea Water Salinity',
    unit: 'PSU',
    defaultMin: 32.0,
    defaultMax: 37.0,
    palette: 'haline',
    scaleType: 'linear',
    step: 0.1,
    description: 'Practical salinity scale measuring dissolved salt content.',
  },
  chlorophyll: {
    id: 'chlorophyll',
    label: 'Chlorophyll-a Concentration',
    unit: 'mg/m³',
    defaultMin: 0.05,
    defaultMax: 10.0,
    palette: 'algae',
    scaleType: 'log',
    step: 0.01,
    description: 'Mass concentration of phytoplankton chlorophyll-a pigment.',
  },
  u_current: {
    id: 'u_current',
    label: 'Zonal Current (U - Eastward)',
    unit: 'm/s',
    defaultMin: -1.5,
    defaultMax: 1.5,
    palette: 'coolwarm',
    scaleType: 'linear',
    step: 0.05,
    description: 'East-West horizontal velocity component.',
  },
  v_current: {
    id: 'v_current',
    label: 'Meridional Current (V - Northward)',
    unit: 'm/s',
    defaultMin: -1.5,
    defaultMax: 1.5,
    palette: 'coolwarm',
    scaleType: 'linear',
    step: 0.05,
    description: 'North-South horizontal velocity component.',
  },
  w_current: {
    id: 'w_current',
    label: 'Vertical Current (W - Upward)',
    unit: 'm/s',
    defaultMin: -0.02,
    defaultMax: 0.02,
    palette: 'coolwarm',
    scaleType: 'linear',
    step: 0.001,
    description: 'Vertical ocean velocity demonstrating upwelling / downwelling.',
  },
  current_speed: {
    id: 'current_speed',
    label: 'Horizontal Current Speed',
    unit: 'm/s',
    defaultMin: 0.0,
    defaultMax: 2.2,
    palette: 'speed',
    scaleType: 'linear',
    step: 0.05,
    description: 'Scalar magnitude of velocity vector sqrt(u² + v²).',
  },
};

/**
 * Generic variable resolver: merges backend-provided metadata with client visualization defaults.
 * Never hardcodes variable names into visualization logic!
 */
export function resolveVariableConfig(variableId: string, metadata?: VariableMetadata): VariableConfig {
  const registered = VARIABLE_CONFIG_REGISTRY[variableId];

  if (metadata) {
    return {
      id: metadata.name,
      label: metadata.display_name || registered?.label || metadata.name,
      unit: metadata.units || registered?.unit || '',
      // Prioritize canonical registered bounds for stable visualization over raw dataset statistical bounds
      defaultMin: registered?.defaultMin ?? metadata.valid_min ?? 0,
      defaultMax: registered?.defaultMax ?? metadata.valid_max ?? 100,
      palette: registered?.palette || metadata.default_palette || 'thermal',
      scaleType: registered?.scaleType || metadata.scale_type || 'linear',
      step: registered?.step ?? 0.1,
      description: metadata.description || registered?.description || '',
    };
  }

  if (registered) {
    return registered;
  }

  // Fallback for completely arbitrary custom variables
  return {
    id: variableId,
    label: variableId.charAt(0).toUpperCase() + variableId.slice(1).replace(/_/g, ' '),
    unit: 'units',
    defaultMin: 0,
    defaultMax: 100,
    palette: 'thermal',
    scaleType: 'linear',
    step: 0.1,
    description: `Oceanographic parameter: ${variableId}`,
  };
}
