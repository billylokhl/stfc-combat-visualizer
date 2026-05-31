import { useState, useEffect } from 'react';
import { generateCombatEvents } from '@stfc-vi/combat-model';
import { transformCombatToVisual, DEFAULT_TIMING, type VisualRoundTimeline } from '@stfc-vi/visualization-model';
import { listShips, getShipById, type ShipCatalogEntry } from '@stfc-vi/visualization-model/examples';
import ShipCanvas from './components/ShipCanvas';
import PlaybackControls from './components/PlaybackControls';
import TimelineDebug from './components/TimelineDebug';
import ShipSelector from './components/ShipSelector';
import ShipMetadataPanel from './components/ShipMetadataPanel';

const ALL_SHIPS = listShips();
const DEFAULT_SHIP_ID = 'augur';

function buildTimelines(entry: ShipCatalogEntry): VisualRoundTimeline[] {
  const ship = entry.ship as any;
  const visualDef = entry.visual;
  if (!ship || !visualDef) return [];
  const combatEvents = generateCombatEvents(ship, 1, 15);
  return transformCombatToVisual(combatEvents, ship, visualDef, DEFAULT_TIMING);
}

export default function App() {
  const [selectedId, setSelectedId] = useState(DEFAULT_SHIP_ID);
  const [selectedEntry, setSelectedEntry] = useState<ShipCatalogEntry>(() => getShipById(DEFAULT_SHIP_ID)!);
  const [timelines, setTimelines] = useState<VisualRoundTimeline[]>(() => buildTimelines(getShipById(DEFAULT_SHIP_ID)!));
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);

  // Rebuild timelines when ship selection changes
  useEffect(() => {
    const entry = getShipById(selectedId);
    if (!entry) return;
    setSelectedEntry(entry);
    setTimelines(buildTimelines(entry));
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentRound(1);
  }, [selectedId]);

  const handlePlayPause = () => setIsPlaying((p) => !p);

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentRound(1);
  };

  const hasVisualization = !!selectedEntry.ship && !!selectedEntry.visual;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: '#2a2a2a',
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'normal', margin: 0 }}>
          Ship Animator — Engineering Prototype
        </h1>
        <ShipSelector
          ships={ALL_SHIPS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Metadata panel */}
      <ShipMetadataPanel entry={selectedEntry} />

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
          {hasVisualization ? (
            <>
              <ShipCanvas
                timelines={timelines}
                visualDefinition={selectedEntry.visual!}
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
                onSpeedChange={setPlaybackSpeed}
              />
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '14px',
              padding: '32px',
              textAlign: 'center',
            }}>
              Visualization configuration is incomplete for this ship.
            </div>
          )}
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
