import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { ArrowDown, Anchor } from 'lucide-react';

export const DepthSlider: React.FC = () => {
  const { dataset, selectedDepth, setSelectedDepth } = useOceanStore();

  const depthLevels = dataset?.coordinates.depth.values || [
    0, 5, 10, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000
  ];
  const maxDepth = depthLevels[depthLevels.length - 1] || 5000;

  // Preset oceanic vertical strata
  const PRESETS = [
    { label: 'Surface', depth: 0, tag: '0m' },
    { label: 'Mixed Layer', depth: 50, tag: '50m' },
    { label: 'Thermocline', depth: 200, tag: '200m' },
    { label: 'Intermediate', depth: 1000, tag: '1000m' },
    { label: 'Deep Abyssal', depth: 4000, tag: '4000m' },
  ];

  // Helper to find nearest discrete depth
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    // Find closest discrete level in model
    const closest = depthLevels.reduce((prev, curr) =>
      Math.abs(curr - rawVal) < Math.abs(prev - rawVal) ? curr : prev
    );
    setSelectedDepth(closest);
  };

  return (
    <div className="control-section">
      <div className="section-header">
        <div className="section-title">
          <ArrowDown size={15} className="text-teal" />
          <span>Depth Slicing (Z-Axis)</span>
        </div>
        <div className="depth-readout">
          <Anchor size={12} className="inline-icon" />
          <span className="depth-val">
            {selectedDepth === 0 ? '0.0 m (Sea Surface)' : `-${selectedDepth.toFixed(1)} m`}
          </span>
        </div>
      </div>

      {/* Preset Strata Buttons */}
      <div className="depth-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            className={`preset-chip ${selectedDepth === preset.depth ? 'active' : ''}`}
            onClick={() => setSelectedDepth(preset.depth)}
            id={`preset-depth-${preset.depth}`}
          >
            <span>{preset.label}</span>
            <span className="preset-depth-tag">{preset.tag}</span>
          </button>
        ))}
      </div>

      {/* Range Slider */}
      <div className="slider-wrapper">
        <input
          type="range"
          min="0"
          max={maxDepth}
          step="5"
          value={selectedDepth}
          onChange={handleSliderChange}
          className="depth-range-input"
          id="depth-slider-input"
        />
        <div className="slider-ticks">
          <span>0m (Surface)</span>
          <span>1000m</span>
          <span>2500m</span>
          <span>{maxDepth}m</span>
        </div>
      </div>
    </div>
  );
};
