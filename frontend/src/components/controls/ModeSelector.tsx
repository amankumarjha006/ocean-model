import React from 'react';
import { useOceanStore, VizMode } from '../../store/oceanStore';
import { Layers, Box, Wind, Orbit } from 'lucide-react';

export const ModeSelector: React.FC = () => {
  const {
    vizMode,
    setVizMode,
    isosurfaceThreshold,
    setIsosurfaceThreshold,
    volumeLayerCount,
    setVolumeLayerCount,
    volumeOpacity,
    setVolumeOpacity,
    currentDensity,
    setCurrentDensity,
    currentSpeedScale,
    setCurrentSpeedScale,
    colorMin,
    colorMax,
    dataset,
    selectedVariable,
  } = useOceanStore();

  const varMeta = dataset?.variables[selectedVariable];
  const unit = varMeta?.units || '';

  const modes: { id: VizMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'slice', label: 'Depth Slice', icon: <Layers size={14} />, desc: '2D Horizontal GPU DataTexture plane' },
    { id: 'volume', label: '3D Volume', icon: <Box size={14} />, desc: 'Stacked depth slices through water column' },
    { id: 'currents', label: 'Currents', icon: <Wind size={14} />, desc: 'Instanced 3D vector arrows & flow particles' },
    { id: 'isosurface', label: 'Isosurface', icon: <Orbit size={14} />, desc: '3D Marching Cubes constant-value shell' },
  ];

  return (
    <div className="control-group" id="mode-selector-group">
      <label className="control-label">
        <span>3D Visualization Mode</span>
        <span className="control-badge text-cyan font-bold">{vizMode.toUpperCase()}</span>
      </label>

      {/* Mode Switcher Tabs */}
      <div className="mode-tabs-grid">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`mode-tab-button ${vizMode === m.id ? 'active' : ''}`}
            onClick={() => setVizMode(m.id)}
            title={m.desc}
          >
            <div className="mode-tab-icon">{m.icon}</div>
            <span className="mode-tab-text">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Mode-Specific Sub-Controls */}
      {vizMode === 'isosurface' && (
        <div className="mode-subpanel">
          <div className="subpanel-header">
            <span className="text-muted text-xs">Isosurface Threshold</span>
            <strong className="mono text-amber text-xs">
              {isosurfaceThreshold.toFixed(1)} {unit}
            </strong>
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
          <div className="range-labels text-xs mono text-muted">
            <span>Min: {colorMin.toFixed(1)}</span>
            <span>Max: {colorMax.toFixed(1)}</span>
          </div>
        </div>
      )}

      {vizMode === 'volume' && (
        <div className="mode-subpanel">
          <div className="subpanel-row">
            <span className="text-muted text-xs">Volume Strata Layers</span>
            <strong className="mono text-cyan text-xs">{volumeLayerCount} layers</strong>
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

          <div className="subpanel-row" style={{ marginTop: '8px' }}>
            <span className="text-muted text-xs">Layer Opacity</span>
            <strong className="mono text-teal text-xs">{Math.round(volumeOpacity * 100)}%</strong>
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
            <span className="text-muted text-xs">Vector Density</span>
            <strong className="mono text-cyan text-xs">
              {currentDensity === 1 ? 'Fine (High)' : currentDensity === 2 ? 'Medium' : 'Coarse'}
            </strong>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={currentDensity}
            onChange={(e) => setCurrentDensity(parseInt(e.target.value, 10))}
            className="slider-input"
          />

          <div className="subpanel-row" style={{ marginTop: '8px' }}>
            <span className="text-muted text-xs">Arrow Speed Scaling</span>
            <strong className="mono text-amber text-xs">{currentSpeedScale.toFixed(1)}x</strong>
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
