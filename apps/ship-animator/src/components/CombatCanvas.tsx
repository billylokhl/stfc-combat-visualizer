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
  onPlaybackComplete?: () => void;
  debugOverlay?: boolean;
  calibrationMode?: boolean;
  onCalibrationChange?: (overrides: Record<string, { nx: number; ny: number }>) => void;
  onCalibrationClick?: (info: {
    role: 'attacker' | 'defender';
    nx: number;
    ny: number;
  }) => void;
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
  onPlaybackComplete,
  debugOverlay = false,
  calibrationMode = false,
  onCalibrationChange,
  onCalibrationClick,
}: CombatCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PlaybackEngine | null>(null);
  const rendererRef = useRef<CombatSceneRenderer | null>(null);
  const animationFrameRef = useRef<number>();
  const completionNotifiedRef = useRef(false);
  const isPlayingRef = useRef(isPlaying);
  const playbackCompleteRef = useRef(onPlaybackComplete);
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
    completionNotifiedRef.current = false;

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
    completionNotifiedRef.current = false;
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

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackCompleteRef.current = onPlaybackComplete;
  }, [onPlaybackComplete]);

  // Sync debug overlay state with the renderer
  useEffect(() => {
    rendererRef.current?.setDebugOverlayEnabled(debugOverlay);
  }, [debugOverlay]);

  // Sync calibration overlay state with the renderer
  useEffect(() => {
    rendererRef.current?.setCalibrationEnabled(calibrationMode);
  }, [calibrationMode]);

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

  // Calibration interactions: drag hardpoints + click to read coords
  useEffect(() => {
    if (!calibrationMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let isDragging = false;

    const getCanvasPoint = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!rendererRef.current) return;
      const { x, y } = getCanvasPoint(e);
      isDragging = rendererRef.current.beginCalibrationDrag(x, y);
      if (isDragging) {
        onCalibrationChange?.(rendererRef.current.getCalibrationOverrides());
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!rendererRef.current || !isDragging) return;
      const { x, y } = getCanvasPoint(e);
      if (rendererRef.current.updateCalibrationDrag(x, y)) {
        onCalibrationChange?.(rendererRef.current.getCalibrationOverrides());
      }
    };

    const handleMouseUp = () => {
      if (!rendererRef.current || !isDragging) return;
      isDragging = false;
      rendererRef.current.endCalibrationDrag();
      onCalibrationChange?.(rendererRef.current.getCalibrationOverrides());
    };

    const handleClick = (e: MouseEvent) => {
      if (!rendererRef.current || isDragging) return;
      const { x, y } = getCanvasPoint(e);
      const info = rendererRef.current.handleCalibrationClick(x, y);
      if (info) {
        onCalibrationClick?.({ role: info.role, nx: info.nx, ny: info.ny });
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [calibrationMode, onCalibrationChange, onCalibrationClick]);

  useEffect(() => {
    if (!engineRef.current || !rendererRef.current) return;

    const engine = engineRef.current;
    const renderer = rendererRef.current;

    const animate = () => {
      let state = engine.getCurrentState();

      if (engine.isComplete()) {
        engine.stopAtEnd();

        if (!completionNotifiedRef.current) {
          completionNotifiedRef.current = true;
            if (isPlayingRef.current) {
              playbackCompleteRef.current?.();
          }
        }

        state = engine.getCurrentState();
      }
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
