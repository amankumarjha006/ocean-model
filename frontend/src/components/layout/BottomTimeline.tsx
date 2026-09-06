import React, { useEffect } from 'react';
import { useOceanStore } from '../../store/oceanStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Calendar,
} from 'lucide-react';

export const BottomTimeline: React.FC = () => {
  const {
    dataset,
    selectedTimeIndex,
    setSelectedTimeIndex,
    isPlaying,
    togglePlayback,
    stepTime,
    playbackSpeedMs,
  } = useOceanStore();

  const timeValues = dataset?.coordinates.time.values || [
    '2026-09-01T00:00:00Z',
    '2026-09-01T06:00:00Z',
    '2026-09-01T12:00:00Z',
    '2026-09-01T18:00:00Z',
    '2026-09-02T00:00:00Z',
    '2026-09-02T06:00:00Z',
    '2026-09-02T12:00:00Z',
    '2026-09-02T18:00:00Z',
  ];
  const totalSteps = timeValues.length;

  // Auto-playback loop
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

  return (
    <footer className="ocean-timeline-bar" id="ocean-timeline-bar">
      <div className="timeline-left-controls">
        <button
          className="btn-playback-step"
          onClick={() => stepTime(-1)}
          title="Previous Time Step (6h)"
          id="btn-timeline-step-back"
        >
          <SkipBack size={15} />
        </button>

        <button
          className={`btn-playback-play ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlayback}
          title={isPlaying ? 'Pause Simulation' : 'Play 4D Time Series'}
          id="btn-timeline-play-pause"
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-1" />}
        </button>

        <button
          className="btn-playback-step"
          onClick={() => stepTime(1)}
          title="Next Time Step (6h)"
          id="btn-timeline-step-forward"
        >
          <SkipForward size={15} />
        </button>

        <div className="timeline-time-display">
          <Calendar size={13} className="text-cyan inline-icon" />
          <span className="time-date">{formattedDate}</span>
          <span className="time-sep">&bull;</span>
          <Clock size={13} className="text-teal inline-icon" />
          <span className="time-clock mono">{formattedTime} UTC</span>
        </div>
      </div>

      {/* Scrubber Area */}
      <div className="timeline-scrubber-container">
        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={selectedTimeIndex}
          onChange={(e) => setSelectedTimeIndex(parseInt(e.target.value, 10))}
          className="timeline-slider-input"
          id="timeline-scrubber"
        />
        <div className="timeline-steps-indicator">
          {timeValues.map((t, idx) => {
            const stepDate = new Date(t);
            const hour = stepDate.getUTCHours();
            const isDayStart = hour === 0;
            return (
              <div
                key={t}
                className={`step-tick ${idx === selectedTimeIndex ? 'active' : ''} ${isDayStart ? 'major' : ''}`}
                onClick={() => setSelectedTimeIndex(idx)}
                title={`${t} (Step ${idx + 1}/${totalSteps})`}
              >
                {isDayStart && <span className="step-tick-label">{stepDate.getUTCDate()}d</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="timeline-right-info">
        <span className="step-counter mono">
          Step <strong>{selectedTimeIndex + 1}</strong> / {totalSteps}
        </span>
        <span className="resolution-badge">Δt = 6h</span>
      </div>
    </footer>
  );
};
