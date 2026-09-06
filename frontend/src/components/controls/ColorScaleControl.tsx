import React from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { COLOR_PALETTES, createCssGradient } from '../../utils/colorScales';
import { Palette } from 'lucide-react';

export const ColorScaleControl: React.FC = () => {
  const {
    colorScale,
    colorMin,
    colorMax,
    scaleType,
    setColorScale,
    setColorRange,
    setScaleType,
    selectedVariable,
    dataset,
  } = useOceanStore();

  const varMeta = dataset?.variables[selectedVariable];
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
    <div className="control-section">
      <div className="section-header">
        <div className="section-title">
          <Palette size={15} className="text-amber" />
          <span>Color Scale & Palette</span>
        </div>
      </div>

      {/* Active Gradient Bar */}
      <div className="colormap-preview-box">
        <div
          className="colormap-gradient-bar"
          style={{ background: createCssGradient(colorScale) }}
        />
        <div className="colormap-range-labels">
          <span className="mono">{colorMin.toFixed(2)} {unit}</span>
          <span className="colormap-name">{COLOR_PALETTES[colorScale]?.name || colorScale}</span>
          <span className="mono">{colorMax.toFixed(2)} {unit}</span>
        </div>
      </div>

      {/* Palette Grid */}
      <div className="palette-grid">
        {Object.entries(COLOR_PALETTES).map(([id, palette]) => (
          <button
            key={id}
            id={`palette-btn-${id}`}
            className={`palette-chip ${colorScale === id ? 'selected' : ''}`}
            onClick={() => setColorScale(id)}
          >
            <div
              className="palette-preview-strip"
              style={{ background: `linear-gradient(to right, ${palette.stops.join(', ')})` }}
            />
            <span className="palette-label">{palette.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Min / Max Inputs and Scale Type Toggle */}
      <div className="range-controls-row">
        <div className="input-group">
          <label className="input-label">Min ({unit}):</label>
          <input
            type="number"
            value={colorMin}
            step="0.1"
            onChange={handleMinChange}
            className="numeric-input mono"
            id="input-color-min"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Max ({unit}):</label>
          <input
            type="number"
            value={colorMax}
            step="0.1"
            onChange={handleMaxChange}
            className="numeric-input mono"
            id="input-color-max"
          />
        </div>

        <div className="scale-type-toggle">
          <label className="input-label">Scale:</label>
          <div className="toggle-button-group">
            <button
              className={`toggle-btn ${scaleType === 'linear' ? 'active' : ''}`}
              onClick={() => setScaleType('linear')}
              title="Linear Colormap Scale"
              id="btn-scale-linear"
            >
              Lin
            </button>
            <button
              className={`toggle-btn ${scaleType === 'log' ? 'active' : ''}`}
              onClick={() => setScaleType('log')}
              title="Logarithmic Colormap Scale"
              id="btn-scale-log"
            >
              Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
