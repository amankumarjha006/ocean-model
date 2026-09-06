import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { Eye, Wind, Navigation, Radio, Box, Mountain, Maximize2 } from 'lucide-react';

export const LayerToggles: React.FC = () => {
  const {
    showOceanVolume,
    showCurrents,
    showArgo,
    showGliders,
    showGrid,
    showBathymetry,
    verticalExaggeration,
    toggleShowOceanVolume,
    toggleShowCurrents,
    toggleShowArgo,
    toggleShowGliders,
    toggleShowGrid,
    toggleShowBathymetry,
    setVerticalExaggeration,
  } = useOceanStore();

  const layers = [
    {
      id: 'toggle-ocean-volume',
      label: 'Ocean 3D Volume Field',
      icon: <Box size={15} className="text-cyan" />,
      active: showOceanVolume,
      toggle: toggleShowOceanVolume,
      tag: 'Field',
    },
    {
      id: 'toggle-currents',
      label: 'Ocean Current Vectors',
      icon: <Wind size={15} className="text-blue" />,
      active: showCurrents,
      toggle: toggleShowCurrents,
      tag: 'U/V/W',
    },
    {
      id: 'toggle-argo',
      label: 'Argo Profiling Floats',
      icon: <Radio size={15} className="text-amber" />,
      active: showArgo,
      toggle: toggleShowArgo,
      tag: 'Floats',
    },
    {
      id: 'toggle-gliders',
      label: 'Autonomous Gliders',
      icon: <Navigation size={15} className="text-emerald" />,
      active: showGliders,
      toggle: toggleShowGliders,
      tag: 'Traj',
    },
    {
      id: 'toggle-bathymetry',
      label: 'Seafloor Bathymetry',
      icon: <Mountain size={15} className="text-indigo" />,
      active: showBathymetry,
      toggle: toggleShowBathymetry,
      tag: 'Terrain',
    },
    {
      id: 'toggle-grid',
      label: 'Coordinate Box & Grid',
      icon: <Maximize2 size={15} className="text-slate" />,
      active: showGrid,
      toggle: toggleShowGrid,
      tag: 'Axes',
    },
  ];

  return (
    <div className="control-section">
      <div className="section-header">
        <div className="section-title">
          <Eye size={15} className="text-cyan" />
          <span>Visualization Layers</span>
        </div>
      </div>

      <div className="layer-list">
        {layers.map((layer) => (
          <button
            key={layer.id}
            id={layer.id}
            className={`layer-item ${layer.active ? 'active' : ''}`}
            onClick={layer.toggle}
          >
            <div className="layer-info">
              {layer.icon}
              <span className="layer-label">{layer.label}</span>
            </div>
            <div className="layer-status">
              <span className="layer-tag">{layer.tag}</span>
              {layer.active ? (
                <span className="toggle-switch on"><span className="toggle-thumb" /></span>
              ) : (
                <span className="toggle-switch off"><span className="toggle-thumb" /></span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Vertical Exaggeration Slider */}
      <div className="sub-control">
        <div className="sub-header">
          <span className="sub-label">Vertical Exaggeration (Z-Scale):</span>
          <span className="sub-value text-cyan mono">{verticalExaggeration}x</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          step="0.5"
          value={verticalExaggeration}
          onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
          className="depth-range-input"
          id="vertical-exaggeration-slider"
        />
      </div>
    </div>
  );
};
