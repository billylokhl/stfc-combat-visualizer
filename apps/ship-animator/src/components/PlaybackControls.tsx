interface PlaybackControlsProps {
  isPlaying: boolean;
  playbackSpeed: number;
  currentRound: number;
  totalRounds: number;
  onPlayPause: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function PlaybackControls({
  isPlaying,
  playbackSpeed,
  currentRound,
  totalRounds,
  onPlayPause,
  onRestart,
  onSpeedChange,
}: PlaybackControlsProps) {
  const speeds = [0.5, 1, 2];

  return (
    <div style={{
      padding: '16px',
      background: '#2a2a2a',
      borderTop: '1px solid #444',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      {/* Play/Pause button */}
      <button
        onClick={onPlayPause}
        style={{
          padding: '8px 20px',
          background: isPlaying ? '#ff6b6b' : '#4caf50',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
      </button>

      {/* Restart button */}
      <button
        onClick={onRestart}
        style={{
          padding: '8px 20px',
          background: '#666',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        ⏮ RESTART
      </button>

      {/* Speed controls */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: '#999' }}>Speed:</span>
        {speeds.map(speed => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            style={{
              padding: '6px 12px',
              background: playbackSpeed === speed ? '#2196f3' : '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Round indicator */}
      <div style={{
        marginLeft: 'auto',
        fontSize: '14px',
        color: '#ccc',
        fontFamily: 'monospace',
      }}>
        Round {currentRound} / {totalRounds}
      </div>
    </div>
  );
}
