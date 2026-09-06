import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { Waves, Activity, RotateCcw, PanelLeft, PanelRight } from 'lucide-react';

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
          <PanelLeft size={16} />
        </button>

        <div className="brand-lockup">
          <div className="brand-logo">
            <Waves size={20} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span className="brand-title-accent">OCEAN</span>-3D
              <span className="prototype-badge">SIH 2026</span>
            </div>
            <div className="brand-subtitle">
              INCOIS Ocean Data System
            </div>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="telemetry-chip">
          <span className="chip-label">Domain</span>
          <span className="chip-value mono" style={{ fontSize: '10px' }}>Indian Ocean 0–30°N, 55–100°E</span>
        </div>

        <div className="telemetry-chip">
          <span className="chip-label">Scenario</span>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="scenario-select-dropdown"
            id="scenario-select"
          >
            <option value="normal">Normal (Baseline)</option>
            <option value="warm_eddy">Warm Eddy</option>
            <option value="cold_eddy">Cold Eddy</option>
            <option value="strong_currents">Strong Currents</option>
          </select>
        </div>

        <div className="telemetry-chip">
          <span className="chip-label">Var</span>
          <span className="chip-value highlight">{varMeta?.display_name || selectedVariable}</span>
        </div>

        <div className="telemetry-chip">
          <span className="chip-label">Depth</span>
          <span className="chip-value mono" style={{ color: 'var(--accent-teal-bright)' }}>
            {selectedDepth === 0 ? '0 m' : `−${selectedDepth} m`}
          </span>
        </div>

        <div className="telemetry-chip">
          <span className="chip-label">UTC</span>
          <span className="chip-value mono">{formattedDate}</span>
        </div>
      </div>

      <div className="header-right">
        <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`} id="backend-status-pill">
          <span className="pulse-dot"></span>
          <Activity size={11} />
          <span>{backendOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        <button
          className="btn-reset"
          onClick={resetView}
          title="Reset Camera & Viewport"
          id="btn-reset-view"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        <button
          className={`icon-btn ${inspectorOpen ? 'active' : ''}`}
          onClick={toggleInspector}
          title="Toggle Metadata Inspector"
          id="btn-toggle-inspector"
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
};
