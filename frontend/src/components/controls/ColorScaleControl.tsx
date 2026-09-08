import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { COLOR_PALETTES, createCssGradient } from '../../utils/colorScales';

export const ColorScaleControl: React.FC = () => {
  const colorScale = useOceanStore((s) => s.colorScale);
  const colorMin = useOceanStore((s) => s.colorMin);
  const colorMax = useOceanStore((s) => s.colorMax);
  const scaleType = useOceanStore((s) => s.scaleType);
  const setColorScale = useOceanStore((s) => s.setColorScale);
  const setColorRange = useOceanStore((s) => s.setColorRange);
  const setScaleType = useOceanStore((s) => s.setScaleType);
  const selectedVariable = useOceanStore((s) => s.selectedVariable);
  const dataset = useOceanStore((s) => s.dataset);

  const varMeta = dataset?.variables?.[selectedVariable];
  const unit = varMeta?.units || '';

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val < colorMax) {
      setColorRange(val, colorMax);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > colorMin) {
      setColorRange(colorMin, val);
    }
  };

  return (
    <div className="colorscale-container">
      {/* Active Gradient Bar */}
      <div className="colormap-active-display">
        <div
          className="colormap-preview-gradient"
          style={{ background: createCssGradient(colorScale) }}
        />
        <div className="colormap-range-bounds mono">
          <span>{colorMin.toFixed(1)} {unit}</span>
          <span className="palette-active-name">{COLOR_PALETTES[colorScale]?.name || colorScale}</span>
          <span>{colorMax.toFixed(1)} {unit}</span>
        </div>
      </div>

      {/* Palette Selection Grid */}
      <div className="section-header-compact">
        <span className="section-title-label">PALETTES</span>
      </div>
      <div className="palette-chip-grid">
        {Object.entries(COLOR_PALETTES).map(([id, palette]) => {
          const isSelected = colorScale === id;
          return (
            <button
              key={id}
              id={`palette-btn-${id}`}
              className={`palette-choice-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => setColorScale(id)}
            >
              <div
                className="palette-swatch-bar"
                style={{ background: `linear-gradient(to right, ${palette.stops.join(', ')})` }}
              />
              <span className="palette-chip-name">{palette.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Min / Max Range Controls */}
      <div className="section-header-compact" style={{ marginTop: '16px' }}>
        <span className="section-title-label">VALUE RANGE</span>
      </div>
      <div className="range-input-row">
        <div className="range-input-col">
          <label className="input-field-label">Min ({unit})</label>
          <input
            type="number"
            value={colorMin}
            step="0.5"
            onChange={handleMinChange}
            className="text-input mono"
            id="input-color-min"
          />
        </div>

        <div className="range-input-col">
          <label className="input-field-label">Max ({unit})</label>
          <input
            type="number"
            value={colorMax}
            step="0.5"
            onChange={handleMaxChange}
            className="text-input mono"
            id="input-color-max"
          />
        </div>
      </div>

      {/* Scale Type Segmented Toggle */}
      <div className="section-header-compact" style={{ marginTop: '16px' }}>
        <span className="section-title-label">SCALING</span>
      </div>
      <div className="scale-toggle-control">
        <button
          className={`scale-toggle-btn ${scaleType === 'linear' ? 'active' : ''}`}
          onClick={() => setScaleType('linear')}
        >
          Linear
        </button>
        <button
          className={`scale-toggle-btn ${scaleType === 'log' ? 'active' : ''}`}
          onClick={() => setScaleType('log')}
        >
          Logarithmic
        </button>
      </div>
    </div>
  );
};
