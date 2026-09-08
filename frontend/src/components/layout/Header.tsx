import React, { useState, useEffect } from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { PanelLeft, PanelRight, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const dataset = useOceanStore((s) => s.dataset);
  const selectedVariable = useOceanStore((s) => s.selectedVariable);
  const selectedDepth = useOceanStore((s) => s.selectedDepth);
  const selectedScenario = useOceanStore((s) => s.selectedScenario);
  const setSelectedScenario = useOceanStore((s) => s.setSelectedScenario);
  const sidebarOpen = useOceanStore((s) => s.sidebarOpen);
  const inspectorOpen = useOceanStore((s) => s.inspectorOpen);
  const toggleSidebar = useOceanStore((s) => s.toggleSidebar);
  const toggleInspector = useOceanStore((s) => s.toggleInspector);

  // Real-time live date & time ticker (updates every second)
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveDateStr = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const liveTimeStr = currentDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

  const varMeta = dataset?.variables?.[selectedVariable];
  const varLabel = varMeta?.display_name || selectedVariable;

  return (
    <header className="ocean-header">
      {/* Left: Branding & Panel Toggle */}
      <div className="header-left">
        <button
          className={`header-icon-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
          title="Toggle Controls Sidebar"
          id="btn-toggle-sidebar"
        >
          <PanelLeft size={16} />
        </button>

        <div className="brand-lockup">
          <div className="brand-main-row">
            <span className="brand-title">OCEAN-3D</span>
            <span className="sih-tag">SIH 2026</span>
          </div>
          <span className="brand-subtitle">INCOIS Ocean Data System</span>
        </div>
      </div>

      {/* Center: Clean Non-wrapping Metadata Groups with generous spacing */}
      <div className="header-center">
        <div className="header-meta-group">
          <span className="meta-label">Domain</span>
          <span className="meta-value mono" title="0–30°N · 55–100°E">Indian Ocean</span>
        </div>

        <span className="meta-divider" />

        <div className="header-meta-group">
          <span className="meta-label">Scenario</span>
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

        <span className="meta-divider" />

        <div className="header-meta-group">
          <span className="meta-label">Variable</span>
          <span className="meta-value highlight variable-header-val" title={varLabel}>{varLabel}</span>
        </div>

        <span className="meta-divider" />

        <div className="header-meta-group">
          <span className="meta-label">Depth</span>
          <span className="meta-value mono depth-chip">
            {selectedDepth === 0 ? '0.0 m (Surface)' : `−${selectedDepth.toFixed(1)} m`}
          </span>
        </div>
      </div>

      {/* Right: Live Real-Time Date & Time Clock + Inspector Toggle */}
      <div className="header-right">
        <div className="live-clock-badge mono" title="Live Real-Time UTC Clock">
          <Clock size={13} className="clock-icon" />
          <span className="live-date">{liveDateStr}</span>
          <span className="live-time-divider">·</span>
          <span className="live-time">{liveTimeStr} UTC</span>
        </div>

        <button
          className={`header-icon-btn ${inspectorOpen ? 'active' : ''}`}
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
