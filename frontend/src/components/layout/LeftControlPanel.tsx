import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { VariableSelector } from '../controls/VariableSelector';
import { ModeSelector } from '../controls/ModeSelector';
import { DepthSlider } from '../controls/DepthSlider';
import { LayerToggles } from '../controls/LayerToggles';
import { SlidersHorizontal, ChevronLeft } from 'lucide-react';

export const LeftControlPanel: React.FC = () => {
  const sidebarOpen = useOceanStore((s) => s.sidebarOpen);
  const toggleSidebar = useOceanStore((s) => s.toggleSidebar);

  if (!sidebarOpen) {
    return null;
  }

  return (
    <aside className="left-control-panel" id="left-control-panel">
      <div className="panel-header">
        <div className="panel-title">
          <SlidersHorizontal size={13} />
          <span>CONTROLS</span>
        </div>
        <button
          className="panel-collapse-btn"
          onClick={toggleSidebar}
          title="Collapse Panel"
          id="btn-collapse-sidebar"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="panel-content scrollable">
        <div className="panel-section">
          <ModeSelector />
        </div>

        <div className="panel-section">
          <VariableSelector />
        </div>

        <div className="panel-section">
          <DepthSlider />
        </div>

        <div className="panel-section">
          <LayerToggles />
        </div>
      </div>
    </aside>
  );
};
