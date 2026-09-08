import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { createCssGradient } from '../../utils/colorScales';
import { Crosshair } from 'lucide-react';

const HoverInspectionTooltip: React.FC = () => {
  const hoveredPoint = useOceanStore((s) => s.hoveredPoint);
  if (!hoveredPoint) return null;

  return (
    <div
      className="hud-inspection-tooltip"
      style={{
        position: 'fixed',
        left: `${Math.min(window.innerWidth - 220, hoveredPoint.x + 14)}px`,
        top: `${Math.min(window.innerHeight - 130, hoveredPoint.y - 30)}px`,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <div className="tooltip-title-bar">
        <Crosshair size={11} />
        <span>Inspection</span>
      </div>
      <div className="tooltip-table mono">
        <div className="tooltip-kv">
          <span className="tooltip-k">Pos</span>
          <span className="tooltip-v">{hoveredPoint.lat.toFixed(2)}°N, {hoveredPoint.lon.toFixed(2)}°E</span>
        </div>
        <div className="tooltip-kv">
          <span className="tooltip-k">Depth</span>
          <span className="tooltip-v">−{hoveredPoint.depth} m</span>
        </div>
        <div className="tooltip-kv primary-val">
          <span className="tooltip-k">{hoveredPoint.varName}</span>
          <span className="tooltip-v">
            <strong>{hoveredPoint.val}</strong> {hoveredPoint.units}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ViewportHUD: React.FC = () => {
  const cameraPreset = useOceanStore((s) => s.cameraPreset);
  const setCameraPreset = useOceanStore((s) => s.setCameraPreset);
  const selectedVariable = useOceanStore((s) => s.selectedVariable);
  const selectedDepth = useOceanStore((s) => s.selectedDepth);
  const colorScale = useOceanStore((s) => s.colorScale);
  const colorMin = useOceanStore((s) => s.colorMin);
  const colorMax = useOceanStore((s) => s.colorMax);
  const scaleType = useOceanStore((s) => s.scaleType);
  const dataset = useOceanStore((s) => s.dataset);
  const currentSlice = useOceanStore((s) => s.currentSlice);
  const selectedScenario = useOceanStore((s) => s.selectedScenario);

  const varMeta = dataset?.variables?.[selectedVariable];
  const unit = varMeta?.units || '';
  const displayName = varMeta?.display_name || selectedVariable;

  return (
    <div className="viewport-hud-overlay">
      {/* Top-Left: Scientific Workstation Status Box */}
      <div className="hud-panel hud-top-left">
        <div className="hud-title-row">
          <span className="hud-primary-title">{displayName.toUpperCase()}</span>
          <span className="hud-scenario-tag mono">{selectedScenario}</span>
        </div>

        <div className="hud-depth-row mono">
          <span className="text-muted">Depth</span>
          <span className="text-accent">{selectedDepth === 0 ? '0 m (Surface)' : `−${selectedDepth.toFixed(1)} m`}</span>
        </div>

        {currentSlice && (
          <div className="hud-stats-grid mono">
            <div className="hud-stat-col">
              <span className="hud-stat-label">MIN</span>
              <span className="hud-stat-num">{currentSlice.min.toFixed(2)}</span>
            </div>
            <div className="hud-stat-col">
              <span className="hud-stat-label">MEAN</span>
              <span className="hud-stat-num">{currentSlice.mean.toFixed(2)}</span>
            </div>
            <div className="hud-stat-col">
              <span className="hud-stat-label">MAX</span>
              <span className="hud-stat-num">{currentSlice.max.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Top-Right: Minimal Navigation Controls [ 3D ] [ Map ] [ Section ] */}
      <div className="hud-panel hud-camera-bar">
        <div className="camera-nav-group" role="group" aria-label="Camera Presets">
          <button
            className={`cam-nav-btn ${cameraPreset === 'default' ? 'active' : ''}`}
            onClick={() => setCameraPreset('default')}
            title="3D Isometric View"
          >
            3D
          </button>
          <button
            className={`cam-nav-btn ${cameraPreset === 'top' ? 'active' : ''}`}
            onClick={() => setCameraPreset('top')}
            title="Top-Down Map View"
          >
            Map
          </button>
          <button
            className={`cam-nav-btn ${cameraPreset === 'side' ? 'active' : ''}`}
            onClick={() => setCameraPreset('side')}
            title="Side Cross-Section"
          >
            Section
          </button>
        </div>
      </div>

      {/* Floating Scientific Hover Tooltip */}
      <HoverInspectionTooltip />

      {/* Bottom-Right: Clean Restrained Colorbar */}
      <div className="hud-panel hud-colorbar">
        <div className="hud-colorbar-header">
          <span className="colorbar-var-title">{displayName}</span>
          <span className="colorbar-scale-type mono">{scaleType.toUpperCase()}</span>
        </div>
        <div
          className="hud-gradient-bar"
          style={{ background: createCssGradient(colorScale) }}
        />
        <div className="hud-colorbar-labels mono">
          <span>{colorMin.toFixed(1)}</span>
          <span className="colorbar-unit">{unit}</span>
          <span>{colorMax.toFixed(1)}</span>
        </div>
      </div>

      {/* Bottom-Left: Coordinate Legend */}
      <div className="hud-panel hud-coordinate-legend">
        <div className="coord-grid mono">
          <div className="coord-row">
            <span className="coord-axis coord-x">X</span>
            <span className="coord-name">Longitude</span>
            <span className="coord-bounds">55–100°E</span>
          </div>
          <div className="coord-row">
            <span className="coord-axis coord-y">Y</span>
            <span className="coord-name">Depth</span>
            <span className="coord-bounds">0–1000m</span>
          </div>
          <div className="coord-row">
            <span className="coord-axis coord-z">Z</span>
            <span className="coord-name">Latitude</span>
            <span className="coord-bounds">0–30°N</span>
          </div>
        </div>
      </div>
    </div>
  );
};
