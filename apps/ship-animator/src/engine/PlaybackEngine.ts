import type { VisualRoundTimeline, VisualEvent } from '@stfc-vi/visualization-model';

/**
 * Active visual events at a specific time
 */
export interface ActiveEvents {
  /** Current round number */
  round: number;
  
  /** Elapsed time in current round (ms) */
  roundTime: number;
  
  /** Events active at this moment */
  active: VisualEvent[];
  
  /** Upcoming events in next 500ms */
  upcoming: VisualEvent[];
}

/**
 * Playback Engine
 * 
 * Manages wall-clock-based playback of visual timelines.
 * Uses performance.now() for precise timing.
 */
export class PlaybackEngine {
  private timelines: VisualRoundTimeline[];
  private startTime: number = 0;
  private pausedTime: number = 0;
  private isPaused: boolean = true;
  private playbackSpeed: number = 1;
  private currentRoundIndex: number = 0;
  private roundStartTime: number = 0;

  constructor(timelines: VisualRoundTimeline[]) {
    this.timelines = timelines;
  }

  /**
   * Start or resume playback
   */
  play(): void {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    
    if (this.pausedTime > 0) {
      // Resume from paused position
      this.startTime = performance.now() - this.pausedTime;
    } else {
      // Start fresh
      this.startTime = performance.now();
      this.roundStartTime = this.startTime;
      this.currentRoundIndex = 0;
    }
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (this.isPaused) return;
    
    this.isPaused = true;
    this.pausedTime = performance.now() - this.startTime;
  }

  /**
   * Restart from beginning
   */
  restart(): void {
    this.isPaused = true;
    this.startTime = 0;
    this.pausedTime = 0;
    this.currentRoundIndex = 0;
    this.roundStartTime = 0;
  }

  /**
   * Set playback speed multiplier
   */
  setSpeed(speed: number): void {
    const wasPlaying = !this.isPaused;
    
    if (wasPlaying) {
      // Pause, adjust time, resume
      const currentElapsed = this.getElapsedTime();
      this.pause();
      this.playbackSpeed = speed;
      this.pausedTime = currentElapsed / speed;
      this.play();
    } else {
      this.playbackSpeed = speed;
    }
  }

  /**
   * Get elapsed time in milliseconds (accounting for speed)
   */
  getElapsedTime(): number {
    if (this.isPaused) {
      return this.pausedTime * this.playbackSpeed;
    }
    return (performance.now() - this.startTime) * this.playbackSpeed;
  }

  /**
   * Get current round and active events
   */
  getCurrentState(): ActiveEvents {
    if (this.timelines.length === 0) {
      return {
        round: 1,
        roundTime: 0,
        active: [],
        upcoming: [],
      };
    }

    const elapsed = this.getElapsedTime();
    
    // Find current round
    let accumulatedTime = 0;
    let roundIndex = 0;
    
    for (let i = 0; i < this.timelines.length; i++) {
      const roundDuration = this.timelines[i].duration;
      
      if (elapsed < accumulatedTime + roundDuration) {
        roundIndex = i;
        break;
      }
      
      accumulatedTime += roundDuration;
      
      // If we've passed all rounds, stay at last round
      if (i === this.timelines.length - 1) {
        roundIndex = i;
      }
    }

    // Calculate time within current round
    let roundStartAccumulated = 0;
    for (let i = 0; i < roundIndex; i++) {
      roundStartAccumulated += this.timelines[i].duration;
    }
    
    const roundTime = elapsed - roundStartAccumulated;
    const currentTimeline = this.timelines[roundIndex];

    // Find active events (events whose timestamp has passed)
    // For this prototype, consider events "active" for 100ms after their timestamp
    const active: VisualEvent[] = [];
    const upcoming: VisualEvent[] = [];
    const ACTIVE_DURATION = 100; // ms
    const UPCOMING_WINDOW = 500; // ms

    for (const event of currentTimeline.events) {
      if (event.timestamp <= roundTime && roundTime < event.timestamp + ACTIVE_DURATION) {
        active.push(event);
      } else if (event.timestamp > roundTime && event.timestamp < roundTime + UPCOMING_WINDOW) {
        upcoming.push(event);
      }
    }

    return {
      round: currentTimeline.round,
      roundTime,
      active,
      upcoming,
    };
  }

  /**
   * Check if playback is active
   */
  isPlaying(): boolean {
    return !this.isPaused;
  }

  /**
   * Get current playback speed
   */
  getSpeed(): number {
    return this.playbackSpeed;
  }

  /**
   * Check if playback is complete
   */
  isComplete(): boolean {
    if (this.timelines.length === 0) return true;
    
    const elapsed = this.getElapsedTime();
    const totalDuration = this.timelines.reduce((sum, t) => sum + t.duration, 0);
    
    return elapsed >= totalDuration;
  }
}
