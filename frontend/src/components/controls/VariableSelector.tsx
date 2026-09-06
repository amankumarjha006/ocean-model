import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { resolveVariableConfig } from '../../features/ocean/variableConfig';
import { Layers, Thermometer, Droplets, Leaf, Compass, ArrowUpCircle } from 'lucide-react';

const VARIABLE_ICONS: Record<string, React.ReactNode> = {
  temperature: <Thermometer size={16} />,
  salinity: <Droplets size={16} />,
  chlorophyll: <Leaf size={16} />,
  u_current: <Compass size={16} />,
  v_current: <Compass size={16} />,
  w_current: <ArrowUpCircle size={16} />,
};

export const VariableSelector: React.FC = () => {
  const { dataset, selectedVariable, setSelectedVariable } = useOceanStore();

  // Dynamically resolve available variables from the dataset metadata
  const variableEntries = dataset?.variables
    ? Object.entries(dataset.variables)
    : Object.entries({
        temperature: { name: 'temperature', display_name: 'Sea Water Temperature', units: 'degC' },
        salinity: { name: 'salinity', display_name: 'Sea Water Salinity', units: 'PSU' },
        chlorophyll: { name: 'chlorophyll', display_name: 'Chlorophyll-a', units: 'mg/m^3' },
        u_current: { name: 'u_current', display_name: 'Eastward Velocity (U)', units: 'm/s' },
        v_current: { name: 'v_current', display_name: 'Northward Velocity (V)', units: 'm/s' },
        w_current: { name: 'w_current', display_name: 'Vertical Velocity (W)', units: 'm/s' },
      });

  return (
    <div className="control-section">
      <div className="section-header">
        <div className="section-title">
          <Layers size={15} className="text-cyan" />
          <span>Active Variable</span>
        </div>
        <span className="badge-count">{variableEntries.length} Available</span>
      </div>

      <div className="variable-grid">
        {variableEntries.map(([key, meta]) => {
          const isSelected = selectedVariable === key;
          const config = resolveVariableConfig(key, meta as any);
          const icon = VARIABLE_ICONS[key] || <Layers size={16} />;

          return (
            <button
              key={key}
              id={`var-btn-${key}`}
              className={`variable-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedVariable(key)}
            >
              <div className="var-icon-container">{icon}</div>
              <div className="var-info">
                <div className="var-label">{config.label}</div>
                <div className="var-subrow">
                  <span className="var-key">{key}</span>
                  <span className="var-unit">{config.unit}</span>
                </div>
              </div>
              {isSelected && <div className="var-active-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
