/**
 * Visualization Model
 *
 * Transforms combat events into visual timeline events.
 * Framework-agnostic abstraction layer between combat logic and animation.
 * No UI code. No rendering code. No browser dependencies.
 */

import type { Ship, WeaponDefinition } from '@stfc-vi/ship-model';
import type { CombatEvent, RoundEvents } from '@stfc-vi/combat-model';

/**
 * Visual event types that can be rendered by an animation engine
 */
export type VisualEventType =
  | 'muzzle_flash'
  | 'recoil'
  | 'projectile_launch'
  | 'impact'
  | 'round_marker';

/**
 * Represents a visual action at a specific point in time
 *
 * Visual events describe HOW gameplay is presented, not WHAT happens in gameplay.
 * A future renderer consumes these events without understanding STFC combat logic.
 */
export interface VisualEvent {
  /** Type of visual event */
  type: VisualEventType;

  /** Timestamp in milliseconds from round start */
  timestamp: number;

  /** Weapon ID associated with this event */
  weaponId?: string;

  /** Hardpoint identifier (e.g., 'left_beam', 'right_beam', 'obliterator') */
  hardpoint?: string;

  /** Additional event-specific data */
  data?: {
    /** Shot index for multi-shot weapons (0-indexed) */
    shotIndex?: number;
    /** Total shots in burst */
    totalShots?: number;
    /** Round number for round_marker events */
    round?: number;
  };
}

/**
 * Visual timeline for a single round
 */
export interface VisualRoundTimeline {
  /** Round number (1-indexed) */
  round: number;

  /** Ordered visual events for this round */
  events: VisualEvent[];

  /** Total duration of this round in milliseconds */
  duration: number;
}

/**
 * Hardpoint positioning metadata
 *
 * Defines the physical location and properties of weapon hardpoints.
 * This allows a future renderer to know where effects should appear.
 */
export interface HardpointDefinition {
  /** Hardpoint identifier (matches WeaponDefinition.hardpoint) */
  id: string;

  /** Display name */
  name: string;

  /** Position hint for rendering (e.g., 'left', 'right', 'center', 'top') */
  position: 'left' | 'right' | 'center' | 'top' | 'bottom';

  /** Weapon type hint for visual styling */
  weaponType?: 'beam' | 'kinetic' | 'energy' | 'special';
}

/**
 * Ship visual configuration
 *
 * Combines ship definition with hardpoint positioning for rendering.
 */
export interface ShipVisualConfig {
  /** Ship reference */
  ship: Ship;

  /** Hardpoint definitions for this ship */
  hardpoints: HardpointDefinition[];
}

/**
 * Timing configuration for visual event generation
 */
export interface VisualTimingConfig {
  /** Delay before muzzle flash (ms) */
  muzzleFlashDelay: number;

  /** Delay before recoil effect (ms) */
  recoilDelay: number;

  /** Delay before projectile launch (ms) */
  projectileLaunchDelay: number;

  /** Delay between shots in a burst (ms) */
  shotInterval: number;

  /** Base delay for weapons by hardpoint type */
  baseDelayByPosition: {
    left: number;
    right: number;
    center: number;
    top: number;
    bottom: number;
  };
}

/**
 * Default timing configuration
 */
export const DEFAULT_TIMING: VisualTimingConfig = {
  muzzleFlashDelay: 50,
  recoilDelay: 0,
  projectileLaunchDelay: 100,
  shotInterval: 50,
  baseDelayByPosition: {
    left: 0,
    right: 200,
    center: 400,
    top: 600,
    bottom: 800,
  },
};

/**
 * Find hardpoint definition for a weapon
 */
function findHardpoint(
  weapon: WeaponDefinition,
  hardpoints: HardpointDefinition[]
): HardpointDefinition | undefined {
  return hardpoints.find(hp => hp.id === weapon.hardpoint);
}

/**
 * Calculate base timing offset for a weapon based on hardpoint position
 */
function calculateBaseOffset(
  hardpoint: HardpointDefinition | undefined,
  config: VisualTimingConfig
): number {
  if (!hardpoint) {
    return 0;
  }
  return config.baseDelayByPosition[hardpoint.position] || 0;
}

/**
 * Transform a weapon_fired combat event into visual events
 *
 * Maps game logic (weapon fired) to presentation (muzzle flash, recoil, projectiles).
 */
function transformWeaponFired(
  event: CombatEvent,
  weapon: WeaponDefinition | undefined,
  hardpoint: HardpointDefinition | undefined,
  config: VisualTimingConfig
): VisualEvent[] {
  if (!weapon || !event.weaponId) {
    return [];
  }

  const visualEvents: VisualEvent[] = [];
  const baseOffset = calculateBaseOffset(hardpoint, config);
  const shots = event.shots || 1;

  // Generate events for each shot
  for (let shotIndex = 0; shotIndex < shots; shotIndex++) {
    const shotOffset = shotIndex * config.shotInterval;

    // Recoil (starts immediately)
    visualEvents.push({
      type: 'recoil',
      timestamp: baseOffset + shotOffset + config.recoilDelay,
      weaponId: event.weaponId,
      hardpoint: hardpoint?.id,
      data: {
        shotIndex,
        totalShots: shots,
      },
    });

    // Muzzle flash (shortly after recoil)
    visualEvents.push({
      type: 'muzzle_flash',
      timestamp: baseOffset + shotOffset + config.muzzleFlashDelay,
      weaponId: event.weaponId,
      hardpoint: hardpoint?.id,
      data: {
        shotIndex,
        totalShots: shots,
      },
    });

    // Projectile launch (after muzzle flash)
    visualEvents.push({
      type: 'projectile_launch',
      timestamp: baseOffset + shotOffset + config.projectileLaunchDelay,
      weaponId: event.weaponId,
      hardpoint: hardpoint?.id,
      data: {
        shotIndex,
        totalShots: shots,
      },
    });
  }

  return visualEvents;
}

/**
 * Transform combat events for a round into visual events
 *
 * @param roundEvents - Combat events for a round
 * @param ship - Ship definition
 * @param hardpoints - Hardpoint definitions
 * @param config - Timing configuration
 * @returns Visual timeline for the round
 */
export function transformRoundToVisual(
  roundEvents: RoundEvents,
  ship: Ship,
  hardpoints: HardpointDefinition[],
  config: VisualTimingConfig = DEFAULT_TIMING
): VisualRoundTimeline {
  const visualEvents: VisualEvent[] = [];

  // Add round marker at start
  visualEvents.push({
    type: 'round_marker',
    timestamp: 0,
    data: {
      round: roundEvents.round,
    },
  });

  // Transform each combat event
  for (const event of roundEvents.events) {
    if (event.type === 'weapon_fired' && event.weaponId) {
      // Find weapon definition
      const weapon = ship.weapons?.find(w => w.id === event.weaponId);
      const hardpoint = weapon ? findHardpoint(weapon, hardpoints) : undefined;

      // Transform to visual events
      const visuals = transformWeaponFired(event, weapon, hardpoint, config);
      visualEvents.push(...visuals);
    }
  }

  // Sort by timestamp
  visualEvents.sort((a, b) => a.timestamp - b.timestamp);

  // Calculate round duration (last event timestamp + buffer)
  const maxTimestamp = visualEvents.reduce(
    (max, e) => Math.max(max, e.timestamp),
    0
  );
  const duration = maxTimestamp + 500; // Add 500ms buffer

  return {
    round: roundEvents.round,
    events: visualEvents,
    duration,
  };
}

/**
 * Transform multiple rounds into visual timelines
 *
 * @param rounds - Array of combat round events
 * @param ship - Ship definition
 * @param hardpoints - Hardpoint definitions
 * @param config - Timing configuration
 * @returns Array of visual timelines
 */
export function transformCombatToVisual(
  rounds: RoundEvents[],
  ship: Ship,
  hardpoints: HardpointDefinition[],
  config: VisualTimingConfig = DEFAULT_TIMING
): VisualRoundTimeline[] {
  return rounds.map(round => transformRoundToVisual(round, ship, hardpoints, config));
}
