import { useEffect, useState } from 'react';
import { generateTwoShipCombat } from '@stfc-vi/combat-model';
import {
  DEFAULT_SEQUENTIAL_ATTACK_TIMING,
  transformTwoShipCombatToSequentialVisual,
  type VisualSceneRoundTimeline,
  type VisualRoundTimeline,
} from '@stfc-vi/visualization-model';
import { listShips, getShipById, type ShipCatalogEntry } from '@stfc-vi/visualization-model/examples';
import CombatCanvas from './components/CombatCanvas';
import PlaybackControls from './components/PlaybackControls';
import TimelineDebug from './components/TimelineDebug';
import ShipSelector from './components/ShipSelector';
import ShipMetadataPanel from './components/ShipMetadataPanel';

const ALL_SHIPS = listShips();
const DEFAULT_ATTACKER_ID = 'augur';
const DEFAULT_DEFENDER_ID = 'vengeance';
const TOTAL_ROUNDS = 15;

const EMPTY_SCENE_TIMELINES: VisualSceneRoundTimeline[] = [];

function buildTwoShipTimelines(
  attackerEntry: ShipCatalogEntry,
  defenderEntry: ShipCatalogEntry
): VisualSceneRoundTimeline[] {
  const attacker = attackerEntry.ship;
  const defender = defenderEntry.ship;
  const attackerVisual = attackerEntry.visual;
  const defenderVisual = defenderEntry.visual;

  if (!attacker || !defender || !attackerVisual || !defenderVisual) {
    return EMPTY_SCENE_TIMELINES;
  }

  const rounds = generateTwoShipCombat(attacker, defender, TOTAL_ROUNDS);
  return transformTwoShipCombatToSequentialVisual(
    rounds,
    attacker,
    attackerVisual,
    defender,
    defenderVisual,
    DEFAULT_SEQUENTIAL_ATTACK_TIMING
  );
}

function getTotalRounds(timelines: VisualSceneRoundTimeline[]): number {
  return timelines.length;
}

function buildAttackerDebugTimelines(
  timelines: VisualSceneRoundTimeline[]
): VisualRoundTimeline[] {
  return timelines.map((timeline) => ({
    round: timeline.round,
    events: timeline.events.filter(
      (event) => event.data?.sourceRole === 'attacker' || !event.data?.sourceRole
    ),
    weaponStates: timeline.weaponStatesByRole.attacker,
    duration: timeline.duration,
  }));
}

export default function App() {
  const [attackerId, setAttackerId] = useState(DEFAULT_ATTACKER_ID);
  const [defenderId, setDefenderId] = useState(DEFAULT_DEFENDER_ID);
  const [attackerEntry, setAttackerEntry] = useState<ShipCatalogEntry>(() => getShipById(DEFAULT_ATTACKER_ID)!);
  const [defenderEntry, setDefenderEntry] = useState<ShipCatalogEntry>(() => getShipById(DEFAULT_DEFENDER_ID)!);
  const [timelines, setTimelines] = useState<VisualSceneRoundTimeline[]>(() =>
    buildTwoShipTimelines(getShipById(DEFAULT_ATTACKER_ID)!, getShipById(DEFAULT_DEFENDER_ID)!)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [debugOverlay, setDebugOverlay] = useState(false);

  useEffect(() => {
    const nextAttacker = getShipById(attackerId);
    const nextDefender = getShipById(defenderId);
    if (!nextAttacker || !nextDefender) return;

    setAttackerEntry(nextAttacker);
    setDefenderEntry(nextDefender);
    setTimelines(buildTwoShipTimelines(nextAttacker, nextDefender));
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentRound(1);
    setResetKey((key) => key + 1);
  }, [attackerId, defenderId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setDebugOverlay((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handlePlayPause = () => setIsPlaying((playing) => !playing);

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentRound(1);
    setResetKey((key) => key + 1);
  };

  const attackerHasVisualization = !!attackerEntry.ship && !!attackerEntry.visual;
  const defenderHasVisualization = !!defenderEntry.ship && !!defenderEntry.visual;
  const canRenderScene = attackerHasVisualization && defenderHasVisualization;
  const totalRounds = getTotalRounds(timelines);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
    }}>
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
        <button
          onClick={() => setDebugOverlay((prev) => !prev)}
          style={{
            marginLeft: 'auto',
            padding: '4px 10px',
            fontSize: '11px',
            fontFamily: 'monospace',
            background: debugOverlay ? '#3a3a00' : '#1a1a1a',
            color: debugOverlay ? '#ffff00' : '#888',
            border: debugOverlay ? '1px solid #ffff00' : '1px solid #444',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Toggle hardpoint debug overlay (D)"
        >
          DEBUG OVERLAY [{debugOverlay ? 'ON' : 'OFF'}] (D)
        </button>
      </div>

      <ShipMetadataPanel entry={attackerEntry} defender={defenderEntry} />

      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
        }}>
          <div style={{ display: 'flex', gap: '12px', padding: '8px 12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#ccc' }}>Attacker</div>
              <ShipSelector ships={ALL_SHIPS} selectedId={attackerId} onSelect={setAttackerId} />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#ccc' }}>Defender</div>
              <ShipSelector ships={ALL_SHIPS} selectedId={defenderId} onSelect={setDefenderId} />
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, borderTop: '1px solid #222' }}>
            {canRenderScene ? (
              <CombatCanvas
                timelines={timelines}
                attackerVisualDefinition={attackerEntry.visual!}
                defenderVisualDefinition={defenderEntry.visual!}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                resetKey={resetKey}
                onTimeUpdate={setCurrentTime}
                onRoundUpdate={setCurrentRound}
                debugOverlay={debugOverlay}
              />
            ) : (
              <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ flex: 1, padding: '24px', color: '#666' }}>
                  {attackerHasVisualization
                    ? 'Attacker visualization is available.'
                    : 'Visualization configuration is incomplete for the Attacker.'}
                </div>
                <div style={{ flex: 1, padding: '24px', color: '#666' }}>
                  {defenderHasVisualization
                    ? 'Defender visualization is available.'
                    : 'Visualization configuration is incomplete for the Defender.'}
                </div>
              </div>
            )}
          </div>

          <PlaybackControls
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            currentRound={currentRound}
            totalRounds={totalRounds}
            onPlayPause={handlePlayPause}
            onRestart={handleRestart}
            onSpeedChange={setPlaybackSpeed}
          />
        </div>

        <TimelineDebug
          timelines={buildAttackerDebugTimelines(timelines)}
          currentTime={currentTime}
          currentRound={currentRound}
        />
      </div>
    </div>
  );
}
