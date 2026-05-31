import { useState, useEffect } from 'react';
import { generateCombatEvents, generateTwoShipCombat } from '@stfc-vi/combat-model';
import { transformCombatToVisual, transformTwoShipCombatToVisual, DEFAULT_TIMING, type VisualRoundTimeline } from '@stfc-vi/visualization-model';
import { listShips, getShipById, type ShipCatalogEntry } from '@stfc-vi/visualization-model/examples';
import ShipCanvas from './components/ShipCanvas';
import PlaybackControls from './components/PlaybackControls';
import TimelineDebug from './components/TimelineDebug';
import ShipSelector from './components/ShipSelector';
import ShipMetadataPanel from './components/ShipMetadataPanel';

const ALL_SHIPS = listShips();
const DEFAULT_SHIP_ID = 'augur';
const DEFAULT_DEFENDER_ID = 'vengeance';

function buildTimelines(entry: ShipCatalogEntry): VisualRoundTimeline[] {
  const ship = entry.ship as any;
  const visualDef = entry.visual;
  if (!ship || !visualDef) return [];
  const combatEvents = generateCombatEvents(ship, 1, 15);
  return transformCombatToVisual(combatEvents, ship, visualDef, DEFAULT_TIMING);
}

function buildTwoShipTimelines(attackerEntry: ShipCatalogEntry, defenderEntry: ShipCatalogEntry) {
  const attacker = attackerEntry.ship as any;
  const defender = defenderEntry.ship as any;
  const attackerVisual = attackerEntry.visual;
  const defenderVisual = defenderEntry.visual;

  if (!attacker || !defender || !attackerVisual || !defenderVisual) return {};

  const rounds = generateTwoShipCombat(attacker, defender, 15);
  return transformTwoShipCombatToVisual(rounds, attacker, attackerVisual, defender, defenderVisual, DEFAULT_TIMING);
}

export default function App() {
  const [selectedId, setSelectedId] = useState(DEFAULT_SHIP_ID);
  const [defenderId, setDefenderId] = useState(DEFAULT_DEFENDER_ID);
  const [selectedEntry, setSelectedEntry] = useState<ShipCatalogEntry>(() => getShipById(DEFAULT_SHIP_ID)!);
  const [defenderEntry, setDefenderEntry] = useState<ShipCatalogEntry>(() => getShipById(DEFAULT_DEFENDER_ID)!);
  const [timelines, setTimelines] = useState<VisualRoundTimeline[]>(() => buildTimelines(getShipById(DEFAULT_SHIP_ID)!));
  const [twoShipTimelines, setTwoShipTimelines] = useState<{ [shipId: string]: VisualRoundTimeline[] }>(() => buildTwoShipTimelines(getShipById(DEFAULT_SHIP_ID)!, getShipById(DEFAULT_DEFENDER_ID)!));
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

  // Rebuild defender when selection changes
  useEffect(() => {
    const entry = getShipById(defenderId);
    if (!entry) return;
    setDefenderEntry(entry);
    setTwoShipTimelines(buildTwoShipTimelines(getShipById(selectedId)!, entry));
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentRound(1);
  }, [defenderId]);

  // Rebuild two-ship timelines when attacker changes
  useEffect(() => {
    setTwoShipTimelines(buildTwoShipTimelines(getShipById(selectedId)!, getShipById(defenderId)!));
  }, [selectedId]);

  const handlePlayPause = () => setIsPlaying((p) => !p);

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentRound(1);
  };

  const attackerHasVisualization = !!selectedEntry.ship && !!selectedEntry.visual;
  const defenderHasVisualization = !!defenderEntry.ship && !!defenderEntry.visual;

  return (
    <div style={{
          <>
            <div style={{ display: 'flex', gap: '12px', padding: '12px' }}>
              <div style={{ flex: 1, border: '1px solid #222' }}>
                {attackerHasVisualization ? (
                  <ShipCanvas
                    timelines={twoShipTimelines[selectedEntry.ship!.id] || timelines}
                    visualDefinition={selectedEntry.visual!}
                    isPlaying={isPlaying}
                    playbackSpeed={playbackSpeed}
                    currentTime={currentTime}
                    currentRound={currentRound}
                    onTimeUpdate={setCurrentTime}
                    onRoundUpdate={setCurrentRound}
                  />
                ) : (
                  <div style={{ padding: '24px', color: '#666' }}>
                    Visualization configuration is incomplete for the Attacker.
                  </div>
                )}
              </div>

              <div style={{ flex: 1, border: '1px solid #222' }}>
                {defenderHasVisualization ? (
                  <ShipCanvas
                    timelines={twoShipTimelines[defenderEntry.ship!.id] || timelines}
                    visualDefinition={defenderEntry.visual!}
                    isPlaying={isPlaying}
                    playbackSpeed={playbackSpeed}
                    currentTime={currentTime}
                    currentRound={currentRound}
                    onTimeUpdate={setCurrentTime}
                    onRoundUpdate={setCurrentRound}
                  />
                ) : (
                  <div style={{ padding: '24px', color: '#666' }}>
                    Visualization configuration is incomplete for the Defender.
                  </div>
                )}
              </div>
            </div>
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
                    visualDefinition={selectedEntry.visual!}
                    isPlaying={isPlaying}
                    playbackSpeed={playbackSpeed}
                    currentTime={currentTime}
                    currentRound={currentRound}
                    onTimeUpdate={setCurrentTime}
                    onRoundUpdate={setCurrentRound}
                  />
                </div>

                <div style={{ flex: 1, border: '1px solid #222' }}>
                  <ShipCanvas
                    timelines={twoShipTimelines[defenderEntry.ship!.id] || timelines}
                    visualDefinition={defenderEntry.visual!}
                    isPlaying={isPlaying}
                    playbackSpeed={playbackSpeed}
                    currentTime={currentTime}
                    currentRound={currentRound}
                    onTimeUpdate={setCurrentTime}
                    onRoundUpdate={setCurrentRound}
                  />
                </div>
              </div>

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
