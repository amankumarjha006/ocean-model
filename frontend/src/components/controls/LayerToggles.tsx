import React from 'react';
import { useOceanStore } from '../../store/oceanStore';

export const LayerToggles: React.FC = () => {
  const showOceanVolume = useOceanStore((s) => s.showOceanVolume);
  const showCurrents = useOceanStore((s) => s.showCurrents);
  const showArgo = useOceanStore((s) => s.showArgo);
  const showGliders = useOceanStore((s) => s.showGliders);
  const showGrid = useOceanStore((s) => s.showGrid);
  const showBathymetry = useOceanStore((s) => s.showBathymetry);
  const verticalExaggeration = useOceanStore((s) => s.verticalExaggeration);
  const toggleShowOceanVolume = useOceanStore((s) => s.toggleShowOceanVolume);
  const toggleShowCurrents = useOceanStore((s) => s.toggleShowCurrents);
  const toggleShowArgo = useOceanStore((s) => s.toggleShowArgo);
  const toggleShowGliders = useOceanStore((s) => s.toggleShowGliders);
  const toggleShowGrid = useOceanStore((s) => s.toggleShowGrid);
  const toggleShowBathymetry = useOceanStore((s) => s.toggleShowBathymetry);
  const setVerticalExaggeration = useOceanStore((s) => s.setVerticalExaggeration);

  const layers = [
    { id: 'toggle-ocean-volume', label: 'Volume Stack', active: showOceanVolume, toggle: toggleShowOceanVolume },
    { id: 'toggle-currents', label: 'Current Vectors', active: showCurrents, toggle: toggleShowCurrents },
    { id: 'toggle-argo', label: 'Argo Floats', active: showArgo, toggle: toggleShowArgo },
    { id: 'toggle-gliders', label: 'Autonomous Gliders', active: showGliders, toggle: toggleShowGliders },
    { id: 'toggle-bathymetry', label: 'Seafloor Bathymetry', active: showBathymetry, toggle: toggleShowBathymetry },
    { id: 'toggle-grid', label: 'Coordinate Grid & Box', active: showGrid, toggle: toggleShowGrid },
  ];

  return (
    <div className="control-group" id="layer-toggles-group">
      <div className="section-header-compact">
        <span className="section-title-label">LAYERS</span>
      </div>

      <div className="layer-toggle-list">
        {layers.map((layer) => (
          <div
            key={layer.id}
            id={layer.id}
            className="layer-toggle-row"
            onClick={layer.toggle}
            role="switch"
            aria-checked={layer.active}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                layer.toggle();
              }
            }}
          >
            <span className="layer-row-label">{layer.label}</span>
            <div className={`switch-control ${layer.active ? 'on' : 'off'}`}>
              <div className="switch-thumb" />
            </div>
          </div>
        ))}
      </div>

      <div className="vertical-exaggeration-control">
        <div className="subpanel-row">
          <span className="control-sublabel">Vertical Exaggeration</span>
          <span className="control-value mono">{verticalExaggeration.toFixed(1)}×</span>
        </div>
        <input
          type="range"
          min="1.0"
          max="10.0"
          step="0.5"
          value={verticalExaggeration}
          onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
          className="slider-input"
          id="vertical-exaggeration-slider"
          aria-label="Vertical exaggeration slider"
        />
        <div className="range-bounds mono">
          <span>1.0×</span>
          <span>5.0×</span>
          <span>10.0×</span>
        </div>
      </div>
    </div>
  );
};
