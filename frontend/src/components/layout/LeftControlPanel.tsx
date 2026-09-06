import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { VariableSelector } from '../controls/VariableSelector';
import { ModeSelector } from '../controls/ModeSelector';
import { DepthSlider } from '../controls/DepthSlider';
import { LayerToggles } from '../controls/LayerToggles';
import { SlidersHorizontal, ChevronLeft } from 'lucide-react';

export const LeftControlPanel: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useOceanStore();

  if (!sidebarOpen) {
    return null;
  }

  return (
    <aside className="left-control-panel" id="left-control-panel">
      <div className="panel-header">
        <div className="panel-title">
          <SlidersHorizontal size={14} />
          <span>Controls</span>
        </div>
        <button
          className="panel-collapse-btn"
          onClick={toggleSidebar}
          title="Collapse Panel"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="panel-content scrollable">
        <ModeSelector />
        <div className="panel-divider" />
        <VariableSelector />
        <div className="panel-divider" />
        <DepthSlider />
        <div className="panel-divider" />
        <LayerToggles />
      </div>
    </aside>
  );
};
