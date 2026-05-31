import { useState, useEffect } from 'react';
import { generateCombatEvents } from '@stfc-vi/combat-model';
import { transformCombatToVisual, DEFAULT_TIMING, type VisualRoundTimeline } from '@stfc-vi/visualization-model';
import { getShipById } from '@stfc-vi/visualization-model/examples';
import ShipCanvas from './components/ShipCanvas';
import PlaybackControls from './components/PlaybackControls';
import TimelineDebug from './components/TimelineDebug';

export default function App() {
  const [timelines, setTimelines] = useState<VisualRoundTimeline[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);

  // Generate timelines on mount
  useEffect(() => {
    const entry = getShipById('augur');
    const ship = entry?.ship as any;
    const visualDef = entry?.visual;
    const combatEvents = generateCombatEvents(ship, 1, 15);
    const visualTimelines = transformCombatToVisual(
      combatEvents,
      ship,
      visualDef!,
      DEFAULT_TIMING
    );
    setTimelines(visualTimelines);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentRound(1);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: '#2a2a2a',
        borderBottom: '1px solid #444',
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'normal' }}>
          Ship Animator v0 - Engineering Prototype
        </h1>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          Ship: {augur.name} | Rounds: 1-15 | Architecture Validation Build
        </p>
      </div>

      {/* Main content area */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Canvas area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
        }}>
          <ShipCanvas
            timelines={timelines}
            visualDefinition={getShipById('augur')!.visual!}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            currentTime={currentTime}
            currentRound={currentRound}
            onTimeUpdate={setCurrentTime}
            onRoundUpdate={setCurrentRound}
          />

          <PlaybackControls
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            currentRound={currentRound}
            totalRounds={timelines.length}
            onPlayPause={handlePlayPause}
            onRestart={handleRestart}
            onSpeedChange={handleSpeedChange}
          />
        </div>

        {/* Debug panel */}
        <TimelineDebug
          timelines={timelines}
          currentTime={currentTime}
          currentRound={currentRound}
        />
      </div>
    </div>
  );
}
