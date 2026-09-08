import React, { useEffect } from 'react';
import { useOceanStore } from '../../store/oceanStore';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export const BottomTimeline: React.FC = () => {
  const dataset = useOceanStore((s) => s.dataset);
  const selectedTimeIndex = useOceanStore((s) => s.selectedTimeIndex);
  const setSelectedTimeIndex = useOceanStore((s) => s.setSelectedTimeIndex);
  const isPlaying = useOceanStore((s) => s.isPlaying);
  const togglePlayback = useOceanStore((s) => s.togglePlayback);
  const stepTime = useOceanStore((s) => s.stepTime);
  const playbackSpeedMs = useOceanStore((s) => s.playbackSpeedMs);

  const timeValues = dataset?.coordinates?.time?.values || [
    '2026-09-01T00:00:00Z',
    '2026-09-01T06:00:00Z',
    '2026-09-01T12:00:00Z',
    '2026-09-01T18:00:00Z',
    '2026-09-02T00:00:00Z',
    '2026-09-02T06:00:00Z',
    '2026-09-02T12:00:00Z',
    '2026-09-02T18:00:00Z',
    '2026-09-03T00:00:00Z',
    '2026-09-03T06:00:00Z',
  ];
  const totalSteps = timeValues.length;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      stepTime(1);
    }, playbackSpeedMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeedMs, stepTime]);

  const currentTimeStr = timeValues[selectedTimeIndex] || timeValues[0];
  const dateObj = new Date(currentTimeStr);

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

  return (
    <footer className="ocean-timeline-bar" id="ocean-timeline-bar">
      {/* Left: Transport Playback Controls */}
      <div className="timeline-left">
        <button
          className="btn-transport"
          onClick={() => stepTime(-1)}
          title="Previous Time Step (6h)"
          id="btn-timeline-step-back"
          aria-label="Previous time step"
        >
          <SkipBack size={14} />
        </button>

        <button
          className={`btn-transport-play ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlayback}
          title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          id="btn-timeline-play-pause"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          className="btn-transport"
          onClick={() => stepTime(1)}
          title="Next Time Step (6h)"
          id="btn-timeline-step-forward"
          aria-label="Next time step"
        >
          <SkipForward size={14} />
        </button>

        <div className="timeline-timestamp mono">
          <span className="timestamp-date">{formattedDate}</span>
          <span className="timestamp-time">{formattedTime} UTC</span>
        </div>
      </div>

      {/* Center: Thin Timeline Scrubber Track */}
      <div className="timeline-center">
        <div className="timeline-slider-wrap">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={selectedTimeIndex}
            onChange={(e) => setSelectedTimeIndex(parseInt(e.target.value, 10))}
            className="timeline-slider"
            id="timeline-slider-input"
            aria-label="Simulation time scrubber"
          />
          <div className="timeline-tick-marks">
            {timeValues.map((t, idx) => (
              <div
                key={t}
                className={`timeline-tick ${idx === selectedTimeIndex ? 'active' : ''}`}
                onClick={() => setSelectedTimeIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Step & Frequency Metadata */}
      <div className="timeline-right mono">
        <span className="timeline-meta-item">
          Step <strong className="text-primary">{selectedTimeIndex + 1}</strong> / {totalSteps}
        </span>
        <span className="timeline-meta-divider">·</span>
        <span className="timeline-meta-item text-secondary">Δt 6h</span>
      </div>
    </footer>
  );
};
