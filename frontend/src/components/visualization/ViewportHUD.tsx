import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { createCssGradient } from '../../utils/colorScales';
import { Layers, Eye, Compass, Crosshair } from 'lucide-react';

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
      case 'slice': return 'DEPTH SLICE (2D GPU)';
      case 'volume': return '3D LAYERED VOLUME';
      case 'currents': return 'CURRENT VECTORS / FLOW';
      case 'isosurface': return '3D ISOSURFACE (MARCHING CUBES)';
    }
  };

  return (
    <div className="viewport-hud-overlay">
      {/* Top-Left HUD Info */}
      <div className="hud-card hud-top-left">
        <div className="hud-row">
          <Layers size={13} className="text-cyan" />
          <span className="hud-title">{varMeta?.display_name || selectedVariable}</span>
          <span className="prototype-badge">{selectedScenario.toUpperCase()}</span>
          <span className="mode-pill-badge">{getModeLabel()}</span>
        </div>
        <div className="hud-sub">
          <span>Depth: </span>
          <strong className="text-teal mono">
            {selectedDepth === 0 ? 'Sea Surface (0m)' : `-${selectedDepth.toFixed(1)} m`}
          </strong>
        </div>
        <div className="hud-sub">
          <span>Exaggeration: </span>
          <span className="mono">{verticalExaggeration}x</span>
        </div>
        {currentSlice && (
          <div className="hud-slice-stats mono">
            <span className="stat-item" title="Slice Min">
              Min: <strong className="text-cyan">{currentSlice.min.toFixed(2)}</strong>
            </span>
            <span className="stat-item" title="Slice Mean">
              Mean: <strong className="text-teal">{currentSlice.mean.toFixed(2)}</strong>
            </span>
            <span className="stat-item" title="Slice Max">
              Max: <strong className="text-amber">{currentSlice.max.toFixed(2)}</strong>
            </span>
            <span className="stat-item text-muted">[{currentSlice.shape[0]}×{currentSlice.shape[1]}]</span>
          </div>
        )}
      </div>

      {/* Camera Presets Toolbar (Top-Right) */}
      <div className="hud-card hud-camera-bar">
        <div className="hud-camera-buttons">
          <button
            className={`cam-preset-btn ${cameraPreset === 'default' ? 'active' : ''}`}
            onClick={() => setCameraPreset('default')}
            title="3D Isometric Orbit View"
          >
            <Compass size={12} />
            <span>3D View</span>
          </button>
          <button
            className={`cam-preset-btn ${cameraPreset === 'top' ? 'active' : ''}`}
            onClick={() => setCameraPreset('top')}
            title="Top-Down 2D Map (Lat/Lon View)"
          >
            <Eye size={12} />
            <span>Top Map</span>
          </button>
          <button
            className={`cam-preset-btn ${cameraPreset === 'side' ? 'active' : ''}`}
            onClick={() => setCameraPreset('side')}
            title="Side Cross-Section (Depth Profile)"
          >
            <Layers size={12} />
            <span>Side Profile</span>
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
            <Crosshair size={12} className="text-cyan" />
            <span className="tooltip-title">Field Inspection</span>
          </div>
          <div className="tooltip-body mono">
            <div className="tooltip-row">
              <span className="text-muted">Lat / Lon:</span>
              <span className="text-white">{hoveredPoint.lat.toFixed(2)}°N, {hoveredPoint.lon.toFixed(2)}°E</span>
            </div>
            <div className="tooltip-row">
              <span className="text-muted">Depth:</span>
              <span className="text-teal">-{hoveredPoint.depth} m</span>
            </div>
            <div className="tooltip-row highlight-row">
              <span className="text-cyan font-bold">{hoveredPoint.varName}:</span>
              <span className="text-amber font-bold text-base">
                {hoveredPoint.val} <small className="text-muted font-normal">{hoveredPoint.units}</small>
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

      {/* Coordinate axes helper badge in Bottom-Left */}
      <div className="hud-card hud-axes-legend">
        <div className="axis-item"><span className="axis-dot red" /> X: Longitude (55°E - 100°E)</div>
        <div className="axis-item"><span className="axis-dot green" /> Y: Depth (0 to -1000m)</div>
        <div className="axis-item"><span className="axis-dot blue" /> Z: Latitude (0°N - 30°N)</div>
      </div>
    </div>
  );
};
