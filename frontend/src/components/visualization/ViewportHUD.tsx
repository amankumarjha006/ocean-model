import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { createCssGradient } from '../../utils/colorScales';
import { Compass, Eye, Layers, Crosshair } from 'lucide-react';

export const ViewportHUD: React.FC = () => {
  const {
    vizMode,
    cameraPreset,
    setCameraPreset,
    selectedVariable,
    selectedDepth,
    colorScale,
    colorMin,
    colorMax,
    scaleType,
    dataset,
    verticalExaggeration,
    currentSlice,
    selectedScenario,
    hoveredPoint,
  } = useOceanStore();

  const varMeta = dataset?.variables[selectedVariable];
  const unit = varMeta?.units || '';

  const getModeLabel = () => {
    switch (vizMode) {
      case 'slice': return 'DEPTH SLICE';
      case 'volume': return '3D VOLUME';
      case 'currents': return 'CURRENTS';
      case 'isosurface': return 'ISOSURFACE';
    }
  };

  return (
    <div className="viewport-hud-overlay">
      {/* Top-Left HUD Info */}
      <div className="hud-card hud-top-left">
        <div className="hud-row">
          <span className="hud-title">{varMeta?.display_name || selectedVariable}</span>
          <span className="prototype-badge">{selectedScenario.toUpperCase()}</span>
          <span className="mode-pill-badge">{getModeLabel()}</span>
        </div>
        <div className="hud-sub mono">
          <span style={{ color: 'var(--text-dim)' }}>Depth </span>
          <span style={{ color: 'var(--accent-teal-bright)' }}>
            {selectedDepth === 0 ? '0 m (surface)' : `−${selectedDepth.toFixed(1)} m`}
          </span>
          <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>Z-scale </span>
          <span>{verticalExaggeration}×</span>
        </div>
        {currentSlice && (
          <div className="hud-slice-stats mono">
            <span className="stat-item">
              Min <strong style={{ color: 'var(--text-secondary)' }}>{currentSlice.min.toFixed(2)}</strong>
            </span>
            <span className="stat-item">
              Mean <strong style={{ color: 'var(--text-secondary)' }}>{currentSlice.mean.toFixed(2)}</strong>
            </span>
            <span className="stat-item">
              Max <strong style={{ color: 'var(--text-secondary)' }}>{currentSlice.max.toFixed(2)}</strong>
            </span>
            <span className="stat-item" style={{ color: 'var(--text-dim)' }}>
              [{currentSlice.shape[0]}×{currentSlice.shape[1]}]
            </span>
          </div>
        )}
      </div>

      {/* Camera Presets Toolbar (Top-Right) */}
      <div className="hud-card hud-camera-bar">
        <div className="hud-camera-buttons">
          <button
            className={`cam-preset-btn ${cameraPreset === 'default' ? 'active' : ''}`}
            onClick={() => setCameraPreset('default')}
            title="3D Isometric View"
          >
            <Compass size={11} />
            <span>3D</span>
          </button>
          <button
            className={`cam-preset-btn ${cameraPreset === 'top' ? 'active' : ''}`}
            onClick={() => setCameraPreset('top')}
            title="Top-Down Map View"
          >
            <Eye size={11} />
            <span>Map</span>
          </button>
          <button
            className={`cam-preset-btn ${cameraPreset === 'side' ? 'active' : ''}`}
            onClick={() => setCameraPreset('side')}
            title="Side Cross-Section"
          >
            <Layers size={11} />
            <span>Section</span>
          </button>
        </div>
      </div>

      {/* Floating Scientific Hover Tooltip */}
      {hoveredPoint && (
        <div
          className="hud-card hud-inspection-tooltip"
          style={{
            position: 'fixed',
            left: `${Math.min(window.innerWidth - 240, hoveredPoint.x + 16)}px`,
            top: `${Math.min(window.innerHeight - 150, hoveredPoint.y - 40)}px`,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <div className="tooltip-header">
            <Crosshair size={11} />
            <span className="tooltip-title">Inspection</span>
          </div>
          <div className="tooltip-body mono">
            <div className="tooltip-row">
              <span style={{ color: 'var(--text-dim)' }}>Position</span>
              <span>{hoveredPoint.lat.toFixed(2)}°N, {hoveredPoint.lon.toFixed(2)}°E</span>
            </div>
            <div className="tooltip-row">
              <span style={{ color: 'var(--text-dim)' }}>Depth</span>
              <span style={{ color: 'var(--accent-teal-bright)' }}>−{hoveredPoint.depth} m</span>
            </div>
            <div className="tooltip-row highlight-row">
              <span style={{ color: 'var(--text-secondary)' }}>{hoveredPoint.varName}</span>
              <span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                  {hoveredPoint.val}
                </strong>
                {' '}
                <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>{hoveredPoint.units}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Colorbar in Bottom-Right */}
      <div className="hud-card hud-colorbar">
        <div className="hud-colorbar-header">
          <span className="hud-var-title">{varMeta?.display_name || selectedVariable}</span>
          <span className="hud-scale-badge mono">{scaleType.toUpperCase()}</span>
        </div>
        <div
          className="hud-gradient-strip"
          style={{ background: createCssGradient(colorScale) }}
        />
        <div className="hud-colorbar-ticks mono">
          <span>{colorMin.toFixed(1)}</span>
          <span className="hud-unit">{unit}</span>
          <span>{colorMax.toFixed(1)}</span>
        </div>
      </div>

      {/* Coordinate axes helper in Bottom-Left */}
      <div className="hud-card hud-axes-legend">
        <div className="axis-item"><span className="axis-dot red" /> X  Lon 55–100°E</div>
        <div className="axis-item"><span className="axis-dot green" /> Y  Depth 0–1000m</div>
        <div className="axis-item"><span className="axis-dot blue" /> Z  Lat 0–30°N</div>
      </div>
    </div>
  );
};
