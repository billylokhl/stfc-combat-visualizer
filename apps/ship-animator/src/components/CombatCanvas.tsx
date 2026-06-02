import { useEffect, useMemo, useRef } from 'react';
import type {
  ShipVisualDefinition,
  VisualSceneRoundTimeline,
  VisualEvent,
  VisualRoundTimeline,
  WeaponVisualState,
} from '@stfc-vi/visualization-model';
import { PlaybackEngine } from '../engine/PlaybackEngine';
import { CombatSceneRenderer } from '../renderer/CombatSceneRenderer';

interface CombatCanvasProps {
  timelines: VisualSceneRoundTimeline[];
  attackerVisualDefinition: ShipVisualDefinition;
  defenderVisualDefinition: ShipVisualDefinition;
  isPlaying: boolean;
  playbackSpeed: number;
  resetKey: number;
  onTimeUpdate: (time: number) => void;
  onRoundUpdate: (round: number) => void;
  debugOverlay?: boolean;
}

const ACTIVE_DURATION = 100;

function findRoundTimeline(
  timelines: VisualSceneRoundTimeline[],
  round: number
): VisualSceneRoundTimeline | undefined {
  return timelines.find((timeline) => timeline.round === round);
}

function getActiveSceneEvents(
  timeline: VisualSceneRoundTimeline | undefined,
  roundTime: number
): VisualEvent[] {
  if (!timeline) return [];

  return timeline.events.filter(
    (event) => event.timestamp <= roundTime && roundTime < event.timestamp + ACTIVE_DURATION
  );
}

function splitEventsByRole(events: VisualEvent[]): {
  attacker: VisualEvent[];
  defender: VisualEvent[];
} {
  const attacker: VisualEvent[] = [];
  const defender: VisualEvent[] = [];

  for (const event of events) {
    if (event.data?.sourceRole === 'defender') {
      defender.push(event);
    } else {
      attacker.push(event);
    }
  }

  return { attacker, defender };
}

function getRoleWeaponStates(
  timeline: VisualSceneRoundTimeline | undefined,
  role: 'attacker' | 'defender'
): WeaponVisualState[] {
  if (!timeline) {
    return [];
  }

  return timeline.weaponStatesByRole[role] || [];
}

export default function CombatCanvas({
  timelines,
  attackerVisualDefinition,
  defenderVisualDefinition,
  isPlaying,
  playbackSpeed,
  resetKey,
  onTimeUpdate,
  onRoundUpdate,
  debugOverlay = false,
}: CombatCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PlaybackEngine | null>(null);
  const rendererRef = useRef<CombatSceneRenderer | null>(null);
  const animationFrameRef = useRef<number>();
  const sceneClockTimelines = useMemo<VisualRoundTimeline[]>(
    () => timelines.map((timeline) => ({
      round: timeline.round,
      events: timeline.events,
      weaponStates: timeline.weaponStates,
      duration: timeline.duration,
    })),
    [timelines]
  );

  useEffect(() => {
    if (!canvasRef.current || sceneClockTimelines.length === 0) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    engineRef.current = new PlaybackEngine(sceneClockTimelines);
    rendererRef.current = new CombatSceneRenderer(
      canvas,
      attackerVisualDefinition,
      defenderVisualDefinition
    );

    const handleResize = () => {
      if (!canvas || !parent || !rendererRef.current) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      rendererRef.current.resize(canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sceneClockTimelines, attackerVisualDefinition, defenderVisualDefinition]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.restart();
    rendererRef.current?.clearProjectileState();
  }, [resetKey]);

  useEffect(() => {
    if (!engineRef.current) return;

    if (isPlaying) {
      engineRef.current.play();
    } else {
      engineRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setSpeed(playbackSpeed);
  }, [playbackSpeed]);

  // Sync debug overlay state with the renderer
  useEffect(() => {
    rendererRef.current?.setDebugOverlayEnabled(debugOverlay);
  }, [debugOverlay]);

  // Click-to-log normalized coordinates when the debug overlay is active
  useEffect(() => {
    if (!debugOverlay || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const handleClick = (e: MouseEvent) => {
      if (!rendererRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      rendererRef.current.handleDebugClick(x, y);
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [debugOverlay]);

  useEffect(() => {
    if (!engineRef.current || !rendererRef.current) return;

    const engine = engineRef.current;
    const renderer = rendererRef.current;

    const animate = () => {
      const state = engine.getCurrentState();
      const sceneRound = findRoundTimeline(timelines, state.round);
      const activeSceneEvents = getActiveSceneEvents(sceneRound, state.roundTime);
      const activeByRole = splitEventsByRole(activeSceneEvents);

      onTimeUpdate(state.roundTime);
      onRoundUpdate(state.round);

      renderer.render({
        round: state.round,
        roundTime: state.roundTime,
        attacker: {
          activeEvents: activeByRole.attacker,
          weaponStates: getRoleWeaponStates(sceneRound, 'attacker'),
        },
        defender: {
          activeEvents: activeByRole.defender,
          weaponStates: getRoleWeaponStates(sceneRound, 'defender'),
        },
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [timelines, onTimeUpdate, onRoundUpdate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
