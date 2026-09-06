import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { Waves, Activity, RotateCcw, PanelLeft, PanelRight, Globe, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    dataset,
    backendOnline,
    selectedVariable,
    selectedDepth,
    selectedTimeIndex,
    selectedScenario,
    setSelectedScenario,
    sidebarOpen,
    inspectorOpen,
    toggleSidebar,
    toggleInspector,
    resetView,
  } = useOceanStore();

  const currentTime = dataset?.coordinates.time.values[selectedTimeIndex] ?? '2026-09-01T00:00:00Z';
  const formattedDate = new Date(currentTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  const varMeta = dataset?.variables[selectedVariable];

  return (
    <header className="ocean-header">
      <div className="header-left">
        <button
          className={`icon-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
          title="Toggle Controls Sidebar"
          id="btn-toggle-sidebar"
        >
          <PanelLeft size={18} />
        </button>

        <div className="brand-lockup">
          <div className="brand-logo">
            <Waves className="ocean-wave-icon" size={22} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span className="brand-title-accent">OCEAN</span>-3D
              <span className="prototype-badge">SIH 2026</span>
            </div>
            <div className="brand-subtitle">
              INCOIS Ocean Data System &bull; ROMS 4D Model
            </div>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="telemetry-chip">
          <Globe size={14} className="chip-icon text-cyan" />
          <span className="chip-label">Domain:</span>
          <span className="chip-value">Indian Ocean (0°N-30°N, 55°E-100°E)</span>
        </div>

        {/* Scenario Selector Dropdown */}
        <div className="telemetry-chip scenario-chip">
          <span className="chip-label">Scenario:</span>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="scenario-select-dropdown mono"
            id="scenario-select"
          >
            <option value="normal">Normal (Baseline Eddies)</option>
            <option value="warm_eddy">Warm Core (Anticyclonic)</option>
            <option value="cold_eddy">Cold Core (Upwelling)</option>
            <option value="strong_currents">Strong Energetic Currents</option>
          </select>
        </div>

        <div className="telemetry-chip">
          <Layers size={14} className="chip-icon text-amber" />
          <span className="chip-label">Var:</span>
          <span className="chip-value highlight">{varMeta?.display_name || selectedVariable}</span>
        </div>

        <div className="telemetry-chip">
          <span className="chip-label">Depth:</span>
          <span className="chip-value text-teal">
            {selectedDepth === 0 ? 'Surface (0m)' : `-${selectedDepth}m`}
          </span>
        </div>

        <div className="telemetry-chip">
          <span className="chip-label">UTC:</span>
          <span className="chip-value mono">{formattedDate}</span>
        </div>
      </div>

      <div className="header-right">
        <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`} id="backend-status-pill">
          <span className="pulse-dot"></span>
          <Activity size={13} />
          <span>{backendOnline ? 'API ONLINE' : 'API DISCONNECTED'}</span>
        </div>

        <button
          className="btn-reset"
          onClick={resetView}
          title="Reset Camera & Viewport"
          id="btn-reset-view"
        >
          <RotateCcw size={14} />
          <span>Reset View</span>
        </button>

        <button
          className={`icon-btn ${inspectorOpen ? 'active' : ''}`}
          onClick={toggleInspector}
          title="Toggle Metadata Inspector"
          id="btn-toggle-inspector"
        >
          <PanelRight size={18} />
        </button>
      </div>
    </header>
  );
};
