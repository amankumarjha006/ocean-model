import React, { useState } from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { ColorScaleControl } from '../controls/ColorScaleControl';
import {
  Info,
  ChevronRight,
  Database,
  Radio,
  Navigation,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { ObservationMetadata } from '../../types/api';

export const RightInfoPanel: React.FC = () => {
  const {
    inspectorOpen,
    toggleInspector,
    selectedVariable,
    dataset,
    selectedObservation,
    setSelectedObservation,
  } = useOceanStore();

  const [activeTab, setActiveTab] = useState<'metadata' | 'observations' | 'colors'>('metadata');

  if (!inspectorOpen) {
    return null;
  }

  const varMeta = dataset?.variables[selectedVariable];
  const observations = dataset?.observations || [];

  return (
    <aside className="right-info-panel" id="right-info-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Info size={16} className="text-cyan" />
          <span>Scientific Metadata & Inspector</span>
        </div>
        <button
          className="panel-collapse-btn"
          onClick={toggleInspector}
          title="Collapse Inspector"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="inspector-tabs">
        <button
          className={`tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
          onClick={() => setActiveTab('metadata')}
        >
          <Database size={13} />
          <span>Variable</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          <span>Color Scale</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'observations' ? 'active' : ''}`}
          onClick={() => setActiveTab('observations')}
        >
          <Radio size={13} />
          <span>Observations ({observations.length})</span>
        </button>
      </div>

      <div className="panel-content scrollable">
        {activeTab === 'metadata' && (
          <div className="metadata-container">
            {varMeta ? (
              <>
                <div className="meta-card">
                  <div className="meta-card-title">{varMeta.display_name}</div>
                  <div className="meta-badge-row">
                    <span className="meta-badge primary">{varMeta.name}</span>
                    <span className="meta-badge accent">{varMeta.units}</span>
                    <span className="meta-badge muted">CF-1.8 Compliant</span>
                  </div>
                  <p className="meta-description">{varMeta.description}</p>
                </div>

                <div className="meta-table">
                  <div className="meta-row">
                    <span className="meta-key">CF Standard Name</span>
                    <span className="meta-val mono">{varMeta.standard_name}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Dimensions (4D)</span>
                    <span className="meta-val mono">
                      [{varMeta.dimensions.join(', ')}]
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Physical Units</span>
                    <span className="meta-val mono">{varMeta.units}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Valid Range</span>
                    <span className="meta-val mono">
                      [{varMeta.valid_min ?? 'N/A'}, {varMeta.valid_max ?? 'N/A'}]
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Scale Transform</span>
                    <span className="meta-val mono">{varMeta.scale_type}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Default Colormap</span>
                    <span className="meta-val mono">{varMeta.default_palette}</span>
                  </div>
                </div>

                {dataset && (
                  <div className="dataset-global-card">
                    <div className="global-card-header">
                      <FileCode size={14} className="text-cyan" />
                      <span>Model Configuration</span>
                    </div>
                    <div className="global-prop">
                      <span className="global-key">Model Source:</span>
                      <span className="global-val">{dataset.source_model}</span>
                    </div>
                    <div className="global-prop">
                      <span className="global-key">Publishing Agency:</span>
                      <span className="global-val">{dataset.institution}</span>
                    </div>
                    <div className="global-prop">
                      <span className="global-key">Conventions:</span>
                      <span className="global-val">{dataset.conventions}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">Select a variable to view its CF metadata.</div>
            )}
          </div>
        )}

        {activeTab === 'colors' && <ColorScaleControl />}

        {activeTab === 'observations' && (
          <div className="observations-container">
            <div className="obs-intro">
              In-situ observational platforms synchronized with the 4D model domain for comparison and validation.
            </div>

            <div className="obs-cards-list">
              {observations.map((obs: ObservationMetadata) => {
                const isSelected = selectedObservation?.id === obs.id;
                const isArgo = obs.platform_type === 'argo';

                return (
                  <div
                    key={obs.id}
                    className={`obs-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedObservation(isSelected ? null : obs)}
                    id={`obs-card-${obs.id}`}
                  >
                    <div className="obs-card-top">
                      <div className="obs-type-indicator">
                        {isArgo ? (
                          <Radio size={14} className="text-amber" />
                        ) : (
                          <Navigation size={14} className="text-emerald" />
                        )}
                        <span className="obs-name">{obs.platform_name}</span>
                      </div>
                      <span className="status-tag active">
                        <CheckCircle2 size={11} />
                        <span>{obs.status}</span>
                      </span>
                    </div>

                    <div className="obs-details-grid">
                      <div className="obs-detail">
                        <span className="obs-detail-label">WMO / ID:</span>
                        <span className="obs-detail-val mono">{obs.id}</span>
                      </div>
                      <div className="obs-detail">
                        <span className="obs-detail-label">Profiles:</span>
                        <span className="obs-detail-val">{obs.profile_count} casts</span>
                      </div>
                      <div className="obs-detail">
                        <span className="obs-detail-label">Depth Range:</span>
                        <span className="obs-detail-val">
                          {obs.depth_range_m[0]}m - {obs.depth_range_m[1]}m
                        </span>
                      </div>
                      <div className="obs-detail">
                        <span className="obs-detail-label">Agency:</span>
                        <span className="obs-detail-val">{obs.institution}</span>
                      </div>
                    </div>

                    <div className="obs-vars-measured">
                      <span className="measured-label">Variables:</span>
                      {obs.variables_measured.map((v) => (
                        <span key={v} className="measured-pill">{v}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
