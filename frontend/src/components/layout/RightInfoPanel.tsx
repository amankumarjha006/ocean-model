import React, { useState } from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { ColorScaleControl } from '../controls/ColorScaleControl';
import { ChevronRight, Radio, Navigation, CheckCircle2 } from 'lucide-react';
import { ObservationMetadata } from '../../types/api';

export const RightInfoPanel: React.FC = () => {
  const inspectorOpen = useOceanStore((s) => s.inspectorOpen);
  const toggleInspector = useOceanStore((s) => s.toggleInspector);
  const selectedVariable = useOceanStore((s) => s.selectedVariable);
  const dataset = useOceanStore((s) => s.dataset);
  const colorScale = useOceanStore((s) => s.colorScale);
  const scaleType = useOceanStore((s) => s.scaleType);
  const colorMin = useOceanStore((s) => s.colorMin);
  const colorMax = useOceanStore((s) => s.colorMax);
  const selectedObservation = useOceanStore((s) => s.selectedObservation);
  const setSelectedObservation = useOceanStore((s) => s.setSelectedObservation);

  const [activeTab, setActiveTab] = useState<'variable' | 'colors' | 'observations'>('variable');

  if (!inspectorOpen) {
    return null;
  }

  const varMeta = dataset?.variables?.[selectedVariable];
  const observations = dataset?.observations || [];

  return (
    <aside className="right-info-panel" id="right-info-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title">
          <span>INSPECTOR</span>
        </div>
        <button
          className="panel-collapse-btn"
          onClick={toggleInspector}
          title="Collapse Inspector"
          id="btn-collapse-inspector"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Tabs with Underline Indicator */}
      <div className="inspector-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'variable'}
          className={`inspector-tab-btn ${activeTab === 'variable' ? 'active' : ''}`}
          onClick={() => setActiveTab('variable')}
        >
          <span>Variable</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'colors'}
          className={`inspector-tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          <span>Color Scale</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'observations'}
          className={`inspector-tab-btn ${activeTab === 'observations' ? 'active' : ''}`}
          onClick={() => setActiveTab('observations')}
        >
          <span>Observations ({observations.length})</span>
        </button>
      </div>

      {/* Panel Content Area */}
      <div className="panel-content scrollable">
        {activeTab === 'variable' && (
          <div className="inspector-tab-pane">
            {varMeta ? (
              <>
                <div className="variable-overview-block">
                  <div className="overview-title">{varMeta.display_name}</div>
                  <div className="overview-subrow mono">
                    <span className="overview-id">{varMeta.name}</span>
                    <span className="overview-unit">{varMeta.units}</span>
                  </div>
                  {varMeta.description && (
                    <p className="overview-desc">{varMeta.description}</p>
                  )}
                </div>

                <div className="metadata-kv-list">
                  <div className="metadata-kv-item">
                    <span className="metadata-k">Standard Name</span>
                    <span className="metadata-v mono">{varMeta.standard_name || '—'}</span>
                  </div>
                  <div className="metadata-kv-item">
                    <span className="metadata-k">Dimensions</span>
                    <span className="metadata-v mono">
                      {varMeta.dimensions?.join(' × ') || 'time × depth × lat × lon'}
                    </span>
                  </div>
                  <div className="metadata-kv-item">
                    <span className="metadata-k">Units</span>
                    <span className="metadata-v mono">{varMeta.units || '—'}</span>
                  </div>
                  <div className="metadata-kv-item">
                    <span className="metadata-k">Valid Range</span>
                    <span className="metadata-v mono">
                      {colorMin.toFixed(1)} → {colorMax.toFixed(1)}
                    </span>
                  </div>
                  <div className="metadata-kv-item">
                    <span className="metadata-k">Scale</span>
                    <span className="metadata-v mono capitalize">{scaleType}</span>
                  </div>
                  <div className="metadata-kv-item">
                    <span className="metadata-k">Palette</span>
                    <span className="metadata-v mono">{colorScale}</span>
                  </div>
                </div>

                {/* Quieter Dataset Information Block */}
                <div className="dataset-source-block">
                  <div className="dataset-block-title">DATASET</div>
                  <div className="dataset-kv-list">
                    <div className="dataset-kv-row">
                      <span className="dataset-k">Source</span>
                      <span className="dataset-v">Synthetic Ocean-Data Generator</span>
                    </div>
                    <div className="dataset-kv-row">
                      <span className="dataset-k">Institution</span>
                      <span className="dataset-v">INCOIS / MoES</span>
                    </div>
                    <div className="dataset-kv-row">
                      <span className="dataset-k">Conventions</span>
                      <span className="dataset-v mono">CF-1.8</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-placeholder">No variable selected</div>
            )}
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="inspector-tab-pane">
            <ColorScaleControl />
          </div>
        )}

        {activeTab === 'observations' && (
          <div className="inspector-tab-pane">
            <div className="obs-summary-text">
              {observations.length} active in-situ platforms reporting
            </div>

            <div className="obs-table-list">
              {observations.map((obs: ObservationMetadata) => {
                const isSelected = selectedObservation?.id === obs.id;
                const isArgo = obs.platform_type === 'argo';
                const lon = ((obs.spatial_extent[0] + obs.spatial_extent[2]) / 2).toFixed(2);
                const lat = ((obs.spatial_extent[1] + obs.spatial_extent[3]) / 2).toFixed(2);

                return (
                  <div
                    key={obs.id}
                    className={`obs-table-row ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedObservation(isSelected ? null : obs)}
                  >
                    <div className="obs-row-left">
                      <div className="obs-icon-indicator">
                        {isArgo ? <Radio size={12} /> : <Navigation size={12} />}
                      </div>
                      <div className="obs-row-meta">
                        <span className="obs-row-id mono">{obs.id}</span>
                        <span className="obs-row-type">{obs.platform_type.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="obs-row-right mono">
                      <span>{lat}°N</span>
                      <span>{lon}°E</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedObservation && (
              <div className="obs-detail-block">
                <div className="obs-detail-header">
                  <CheckCircle2 size={13} className="text-accent" />
                  <span className="mono">{selectedObservation.id}</span>
                </div>
                <div className="obs-detail-props">
                  <div className="metadata-kv-item">
                    <span className="metadata-k">Type</span>
                    <span className="metadata-v">{selectedObservation.platform_type}</span>
                  </div>
                  <div className="metadata-kv-item">
                    <span className="metadata-k">Depth Range</span>
                    <span className="metadata-v mono">
                      {selectedObservation.depth_range_m[0]}m – {selectedObservation.depth_range_m[1]}m
                    </span>
                  </div>
                  <div className="metadata-kv-item">
                    <span className="metadata-k">Observed Vars</span>
                    <span className="metadata-v mono">
                      {selectedObservation.variables_measured?.join(', ') || '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
