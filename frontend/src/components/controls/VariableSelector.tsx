import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { resolveVariableConfig } from '../../features/ocean/variableConfig';

export const VariableSelector: React.FC = () => {
  const dataset = useOceanStore((s) => s.dataset);
  const selectedVariable = useOceanStore((s) => s.selectedVariable);
  const setSelectedVariable = useOceanStore((s) => s.setSelectedVariable);

  const variableEntries = dataset?.variables
    ? Object.entries(dataset.variables)
    : Object.entries({
        temperature: { name: 'temperature', display_name: 'Sea Water Temperature', units: 'degC' },
        salinity: { name: 'salinity', display_name: 'Sea Water Salinity', units: 'PSU' },
        chlorophyll: { name: 'chlorophyll', display_name: 'Chlorophyll-a', units: 'mg/m³' },
        u_current: { name: 'u_current', display_name: 'Eastward Velocity (U)', units: 'm/s' },
        v_current: { name: 'v_current', display_name: 'Northward Velocity (V)', units: 'm/s' },
        w_current: { name: 'w_current', display_name: 'Vertical Velocity (W)', units: 'm/s' },
      });

  return (
    <div className="control-group" id="variable-selector-group">
      <div className="section-header-compact">
        <span className="section-title-label">ACTIVE VARIABLE</span>
        <span className="section-counter mono">{variableEntries.length}</span>
      </div>

      <div className="variable-list" role="listbox" aria-label="Ocean Variables">
        {variableEntries.map(([key, meta]) => {
          const isSelected = selectedVariable === key;
          const config = resolveVariableConfig(key, meta as any);

          return (
            <button
              key={key}
              id={`var-btn-${key}`}
              role="option"
              aria-selected={isSelected}
              className={`variable-row ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedVariable(key)}
            >
              <div className="variable-row-main">
                <span className="variable-display-name">{config.label}</span>
                <span className="variable-unit mono">{config.unit}</span>
              </div>
              <div className="variable-row-sub">
                <span className="variable-id mono">{key}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
