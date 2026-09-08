import React from 'react';
import { useOceanStore } from '../../store/oceanStore';

export const DepthSlider: React.FC = () => {
  const dataset = useOceanStore((s) => s.dataset);
  const selectedDepth = useOceanStore((s) => s.selectedDepth);
  const setSelectedDepth = useOceanStore((s) => s.setSelectedDepth);

  const depthLevels = dataset?.coordinates?.depth?.values || [
    0, 5, 10, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000
  ];
  const maxDepth = depthLevels[depthLevels.length - 1] || 1000;

  const PRESETS = [
    { label: 'Surface', depth: 0 },
    { label: 'Mixed Layer', depth: 50 },
    { label: 'Thermocline', depth: 200 },
    { label: 'Intermediate', depth: 500 },
    { label: 'Deep Ocean', depth: 1000 },
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    const closest = depthLevels.reduce((prev, curr) =>
      Math.abs(curr - rawVal) < Math.abs(prev - rawVal) ? curr : prev
    );
    setSelectedDepth(closest);
  };

  return (
    <div className="control-group" id="depth-control-group">
      <div className="section-header-compact">
        <span className="section-title-label">DEPTH</span>
        <span className="depth-numeric-readout mono">
          {selectedDepth === 0 ? '0 m (Surface)' : `−${selectedDepth.toFixed(1)} m`}
        </span>
      </div>

      {/* Range Slider */}
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max={maxDepth}
          step="5"
          value={selectedDepth}
          onChange={handleSliderChange}
          className="slider-input depth-slider"
          id="depth-slider-input"
          aria-label="Depth slice slider"
        />
        <div className="range-bounds mono">
          <span>0 m</span>
          <span>500 m</span>
          <span>{maxDepth} m</span>
        </div>
      </div>

      {/* Preset Strata Buttons */}
      <div className="strata-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            className={`strata-btn ${Math.abs(selectedDepth - preset.depth) < 1 ? 'active' : ''}`}
            onClick={() => setSelectedDepth(preset.depth)}
            id={`preset-depth-${preset.depth}`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
