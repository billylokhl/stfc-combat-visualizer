import { useEffect, useRef } from 'react';
import type {
  ShipVisualDefinition,
  VisualRoundTimeline,
} from '@stfc-vi/visualization-model';
import { PlaybackEngine } from '../engine/PlaybackEngine';
import { CanvasRenderer } from '../renderer/CanvasRenderer';

interface ShipCanvasProps {
  timelines: VisualRoundTimeline[];
  visualDefinition: ShipVisualDefinition;
  isPlaying: boolean;
  playbackSpeed: number;
  currentTime: number;
  currentRound: number;
  onTimeUpdate: (time: number) => void;
  onRoundUpdate: (round: number) => void;
}

export default function ShipCanvas({
  timelines,
  visualDefinition,
  isPlaying,
  playbackSpeed,
  onTimeUpdate,
  onRoundUpdate,
}: ShipCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PlaybackEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize engine and renderer
  useEffect(() => {
    if (!canvasRef.current || timelines.length === 0) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    // Set canvas size
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Create engine and renderer
    engineRef.current = new PlaybackEngine(timelines);
  rendererRef.current = new CanvasRenderer(canvas, visualDefinition);

    // Resize handler
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
  }, [timelines, visualDefinition]);

  // Update engine state when controls change
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

  // Animation loop
  useEffect(() => {
    if (!engineRef.current || !rendererRef.current) return;

    const engine = engineRef.current;
    const renderer = rendererRef.current;

    const animate = () => {
      const state = engine.getCurrentState();

      // Update parent component
      onTimeUpdate(state.roundTime);
      onRoundUpdate(state.round);

      // Render
      renderer.render(
        state.round,
        state.roundTime,
        state.active,
        state.weaponStates
      );

      // Continue loop
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
