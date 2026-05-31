import type { VisualRoundTimeline } from '@stfc-vi/visualization-model';

interface TimelineDebugProps {
  timelines: VisualRoundTimeline[];
  currentTime: number;
  currentRound: number;
}

export default function TimelineDebug({
  timelines,
  currentTime,
  currentRound,
}: TimelineDebugProps) {
  const currentTimeline = timelines.find(t => t.round === currentRound);
  
  if (!currentTimeline) {
    return (
      <div style={{
        width: '350px',
        background: '#1a1a1a',
        borderLeft: '1px solid #444',
        padding: '16px',
        overflowY: 'auto',
      }}>
        <h2 style={{ fontSize: '14px', marginBottom: '16px', color: '#888' }}>
          Timeline Debug
        </h2>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Loading...
        </p>
      </div>
    );
  }

  // Find active events (within 100ms window)
  const ACTIVE_WINDOW = 100;
  const activeEvents = currentTimeline.events.filter(
    e => e.timestamp <= currentTime && currentTime < e.timestamp + ACTIVE_WINDOW
  );

  // Find upcoming events (next 500ms)
  const UPCOMING_WINDOW = 500;
  const upcomingEvents = currentTimeline.events.filter(
    e => e.timestamp > currentTime && e.timestamp < currentTime + UPCOMING_WINDOW
  );

  // Format event type with icon
  const formatEventType = (type: string) => {
    const icons: Record<string, string> = {
      round_marker: '🏁',
      recoil: '↩️',
      muzzle_flash: '💥',
      projectile_launch: '🚀',
      impact: '💢',
    };
    return `${icons[type] || '•'} ${type}`;
  };

  return (
    <div style={{
      width: '350px',
      background: '#1a1a1a',
      borderLeft: '1px solid #444',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #444',
      }}>
        <h2 style={{ fontSize: '14px', marginBottom: '8px', color: '#fff' }}>
          Timeline Debug
        </h2>
        <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          <div>Round: {currentRound}</div>
          <div>Time: {currentTime.toFixed(0)}ms</div>
          <div>Duration: {currentTimeline.duration}ms</div>
          <div>Total Events: {currentTimeline.events.length}</div>
        </div>
      </div>

      {/* Active Events */}
      <div style={{ padding: '16px', borderBottom: '1px solid #333' }}>
        <h3 style={{
          fontSize: '12px',
          color: '#4caf50',
          marginBottom: '8px',
          fontWeight: 'bold',
        }}>
          Active Events ({activeEvents.length})
        </h3>
        
        {activeEvents.length === 0 ? (
          <p style={{ fontSize: '11px', color: '#666' }}>None</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeEvents.map((event, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px',
                  background: '#2a2a2a',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                <div style={{ color: '#4caf50', marginBottom: '4px' }}>
                  {formatEventType(event.type)}
                </div>
                <div style={{ color: '#999' }}>
                  {event.timestamp}ms
                  {event.hardpoint && ` • ${event.hardpoint}`}
                </div>
                {event.data?.shotIndex !== undefined && (
                  <div style={{ color: '#666', fontSize: '10px' }}>
                    Shot {event.data.shotIndex + 1}/{event.data.totalShots}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontSize: '12px',
          color: '#2196f3',
          marginBottom: '8px',
          fontWeight: 'bold',
        }}>
          Upcoming Events ({upcomingEvents.length})
        </h3>
        
        {upcomingEvents.length === 0 ? (
          <p style={{ fontSize: '11px', color: '#666' }}>None</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {upcomingEvents.slice(0, 10).map((event, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px',
                  background: '#222',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: '#888',
                }}
              >
                <div>
                  {formatEventType(event.type)}
                  <span style={{ float: 'right', color: '#666' }}>
                    +{(event.timestamp - currentTime).toFixed(0)}ms
                  </span>
                </div>
                {event.hardpoint && (
                  <div style={{ fontSize: '9px', color: '#555', marginTop: '2px' }}>
                    {event.hardpoint}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Round Events List */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #333',
        flex: 1,
        overflowY: 'auto',
      }}>
        <h3 style={{
          fontSize: '12px',
          color: '#999',
          marginBottom: '8px',
          fontWeight: 'bold',
        }}>
          All Round Events
        </h3>
        
        <div style={{
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#666',
        }}>
          {currentTimeline.events.map((event, idx) => {
            const isPast = event.timestamp <= currentTime;
            return (
              <div
                key={idx}
                style={{
                  padding: '4px',
                  color: isPast ? '#444' : '#888',
                  background: isPast ? '#1a1a1a' : 'transparent',
                }}
              >
                {event.timestamp.toString().padStart(4, ' ')}ms - {event.type}
                {event.hardpoint && ` (${event.hardpoint})`}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
