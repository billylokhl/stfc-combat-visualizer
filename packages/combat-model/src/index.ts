/**
 * Combat Model
 *
 * Combat mechanics and event generation.
 * No UI code. No animation code.
 */

/**
 * Represents an individual weapon system.
 *
 * Responsibilities:
 * - weapon identity
 * - damage type
 * - average damage
 * - timing
 * - hardpoint assignment
 */
export interface Weapon {
  /** Unique weapon identifier */
  id: string;

  /** Weapon display name */
  name: string;

  /** Hardpoint assignment (e.g., "primary", "secondary", "tertiary") */
  hardpoint: string;

  /** Damage type (e.g., "kinetic", "energy") */
  damageType: string;

  /** Average damage value */
  averageDamage: number;

  /** Weapon timing configuration */
  timing: {
    /** Cooldown between shots in seconds */
    cooldown: number;

    /** Initial delay before first shot */
    initialDelay?: number;
  };
}

/**
 * Represents a combat action occurring at a specific point in time.
 *
 * Examples:
 * - weapon fired
 * - projectile launched
 * - impact occurred
 *
 * Combat events are the canonical interface between combat logic and visual rendering.
 */
export interface CombatEvent {
  /** Event type identifier */
  type: CombatEventType;

  /** Timestamp when the event occurs (in seconds from combat start) */
  timestamp: number;

  /** Weapon ID associated with this event (if applicable) */
  weaponId?: string;

  /** Additional event data */
  data?: unknown;
}

/**
 * Types of combat events
 */
export type CombatEventType =
  | 'weapon_fired'
  | 'projectile_launched'
  | 'impact'
  | 'round_start'
  | 'round_end';

/**
 * Combat timeline containing ordered events
 */
export interface CombatTimeline {
  /** Ordered array of combat events */
  events: CombatEvent[];

  /** Total duration of the timeline in seconds */
  duration: number;
}
