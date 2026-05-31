import { useEffect, useState } from 'react';
import { generateTwoShipCombat } from '@stfc-vi/combat-model';
import {
  DEFAULT_TIMING,
  transformTwoShipCombatToRoleVisual,
  type TwoShipVisualTimelines,
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

const EMPTY_TWO_SHIP_TIMELINES: TwoShipVisualTimelines = {
  attacker: [],
  defender: [],
};

function buildTwoShipTimelines(
  attackerEntry: ShipCatalogEntry,
  defenderEntry: ShipCatalogEntry
): TwoShipVisualTimelines {
  const attacker = attackerEntry.ship;
  const defender = defenderEntry.ship;
  const attackerVisual = attackerEntry.visual;
  const defenderVisual = defenderEntry.visual;

  if (!attacker || !defender || !attackerVisual || !defenderVisual) {
    return EMPTY_TWO_SHIP_TIMELINES;
  }

  const rounds = generateTwoShipCombat(attacker, defender, TOTAL_ROUNDS);
  return transformTwoShipCombatToRoleVisual(
    rounds,
    attacker,
    attackerVisual,
    defender,
    defenderVisual,
    DEFAULT_TIMING
  );
}

function getTotalRounds(timelines: TwoShipVisualTimelines): number {
  return Math.max(timelines.attacker.length, timelines.defender.length);
}

function buildAttackerDebugTimelines(
  timelines: TwoShipVisualTimelines
): VisualRoundTimeline[] {
  return timelines.attacker;
}

export default function App() {
  const [attackerId, setAttackerId] = useState(DEFAULT_ATTACKER_ID);
  const [defenderId, setDefenderId] = useState(DEFAULT_DEFENDER_ID);
  const [attackerEntry, setAttackerEntry] = useState<ShipCatalogEntry>(() => getShipById(DEFAULT_ATTACKER_ID)!);
  const [defenderEntry, setDefenderEntry] = useState<ShipCatalogEntry>(() => getShipById(DEFAULT_DEFENDER_ID)!);
  const [timelines, setTimelines] = useState<TwoShipVisualTimelines>(() =>
    buildTwoShipTimelines(getShipById(DEFAULT_ATTACKER_ID)!, getShipById(DEFAULT_DEFENDER_ID)!)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [resetKey, setResetKey] = useState(0);

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
