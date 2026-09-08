import React from 'react';
import { useOceanStore, VizMode } from '../../store/oceanStore';
import { Layers, Box, Wind, Orbit } from 'lucide-react';

export const ModeSelector: React.FC = () => {
  const vizMode = useOceanStore((s) => s.vizMode);
  const setVizMode = useOceanStore((s) => s.setVizMode);
  const isosurfaceThreshold = useOceanStore((s) => s.isosurfaceThreshold);
  const setIsosurfaceThreshold = useOceanStore((s) => s.setIsosurfaceThreshold);
  const volumeLayerCount = useOceanStore((s) => s.volumeLayerCount);
  const setVolumeLayerCount = useOceanStore((s) => s.setVolumeLayerCount);
  const volumeOpacity = useOceanStore((s) => s.volumeOpacity);
  const setVolumeOpacity = useOceanStore((s) => s.setVolumeOpacity);
  const currentDensity = useOceanStore((s) => s.currentDensity);
  const setCurrentDensity = useOceanStore((s) => s.setCurrentDensity);
  const currentSpeedScale = useOceanStore((s) => s.currentSpeedScale);
  const setCurrentSpeedScale = useOceanStore((s) => s.setCurrentSpeedScale);
  const colorMin = useOceanStore((s) => s.colorMin);
  const colorMax = useOceanStore((s) => s.colorMax);
  const dataset = useOceanStore((s) => s.dataset);
  const selectedVariable = useOceanStore((s) => s.selectedVariable);

  const varMeta = dataset?.variables?.[selectedVariable];
  const unit = varMeta?.units || '';

  const modes: { id: VizMode; label: string; icon: React.ReactNode }[] = [
    { id: 'slice', label: 'Depth Slice', icon: <Layers size={13} /> },
    { id: 'volume', label: '3D Volume', icon: <Box size={13} /> },
    { id: 'currents', label: 'Currents', icon: <Wind size={13} /> },
    { id: 'isosurface', label: 'Isosurface', icon: <Orbit size={13} /> },
  ];

  return (
    <div className="control-group" id="mode-selector-group">
      <div className="section-header-compact">
        <span className="section-title-label">VISUALIZATION MODE</span>
      </div>

      {/* Segmented Mode Control */}
      <div className="segmented-control" role="tablist">
        {modes.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={vizMode === m.id}
            className={`segmented-btn ${vizMode === m.id ? 'active' : ''}`}
            onClick={() => setVizMode(m.id)}
            id={`mode-btn-${m.id}`}
          >
            <span className="segmented-icon">{m.icon}</span>
            <span className="segmented-label">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Mode-Specific Sub-Controls */}
      {vizMode === 'isosurface' && (
        <div className="mode-subpanel">
          <div className="subpanel-row">
            <span className="control-sublabel">Threshold</span>
            <span className="control-value mono">
              {isosurfaceThreshold.toFixed(1)} {unit}
            </span>
          </div>
          <input
            type="range"
            min={colorMin}
            max={colorMax}
            step={(colorMax - colorMin) / 50 || 0.1}
            value={isosurfaceThreshold}
            onChange={(e) => setIsosurfaceThreshold(parseFloat(e.target.value))}
            className="slider-input"
          />
          <div className="range-bounds mono">
            <span>{colorMin.toFixed(1)}</span>
            <span>{colorMax.toFixed(1)}</span>
          </div>
        </div>
      )}

      {vizMode === 'volume' && (
        <div className="mode-subpanel">
          <div className="subpanel-row">
            <span className="control-sublabel">Strata Layers</span>
            <span className="control-value mono">{volumeLayerCount}</span>
          </div>
          <input
            type="range"
            min={4}
            max={18}
            step={2}
            value={volumeLayerCount}
            onChange={(e) => setVolumeLayerCount(parseInt(e.target.value, 10))}
            className="slider-input"
          />

          <div className="subpanel-row" style={{ marginTop: '10px' }}>
            <span className="control-sublabel">Layer Opacity</span>
            <span className="control-value mono">{Math.round(volumeOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.15}
            max={0.85}
            step={0.05}
            value={volumeOpacity}
            onChange={(e) => setVolumeOpacity(parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>
      )}

      {vizMode === 'currents' && (
        <div className="mode-subpanel">
          <div className="subpanel-row">
            <span className="control-sublabel">Vector Density</span>
            <span className="control-value mono">
              {currentDensity === 1 ? 'High' : currentDensity === 2 ? 'Medium' : 'Sparse'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={currentDensity}
            onChange={(e) => setCurrentDensity(parseInt(e.target.value, 10))}
            className="slider-input"
          />

          <div className="subpanel-row" style={{ marginTop: '10px' }}>
            <span className="control-sublabel">Speed Scale</span>
            <span className="control-value mono">{currentSpeedScale.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.1}
            value={currentSpeedScale}
            onChange={(e) => setCurrentSpeedScale(parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>
      )}
    </div>
  );
};
