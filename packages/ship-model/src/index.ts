/**
 * Ship Model
 *
 * Framework-agnostic ship definitions and metadata.
 * No UI code. No animation code.
 */

/**
 * Represents a ship and its metadata.
 *
 * Responsibilities:
 * - identity
 * - classification
 * - statistics
 * - weapon definitions
 * - firing pattern definitions
 */
export interface Ship {
  /** Unique identifier for the ship */
  id: string;

  /** Display name of the ship */
  name: string;

  /** Ship classification (e.g., Battleship, Explorer, Interceptor) */
  classification: string;

  /** Ship faction */
  faction?: string;

  /** Ship tier/grade */
  tier?: number;

  /** Base ship statistics */
  stats?: {
    health?: number;
    shield?: number;
    attack?: number;
    defense?: number;
    accuracy?: number;
    evasion?: number;
  };

  /** Weapon definitions assigned to this ship */
  weapons?: WeaponDefinition[];

  /** Firing pattern definitions */
  firingPatterns?: FiringPattern[];
}

/**
 * Weapon definition on a ship
 */
export interface WeaponDefinition {
  /** Weapon identifier */
  id: string;

  /** Weapon display name */
  name: string;

  /** Hardpoint assignment (e.g., "primary", "secondary", "tertiary") */
  hardpoint: string;

  /** Damage type (e.g., "kinetic", "energy") */
  damageType?: string;

  /** Average damage value */
  averageDamage?: number;

  /** Number of shots fired when this weapon activates */
  shotsPerActivation: number;

  /** Firing schedule defining when this weapon activates */
  firingSchedule: FiringSchedule;
}

/**
 * Defines when a weapon fires during combat
 */
export type FiringSchedule =
  | EveryRoundSchedule
  | IntervalSchedule
  | SpecificRoundsSchedule;

/**
 * Weapon fires every round
 */
export interface EveryRoundSchedule {
  type: 'every_round';
}

/**
 * Weapon fires at regular intervals
 *
 * Example: every 3 rounds starting on round 2
 */
export interface IntervalSchedule {
  type: 'interval';
  /** First round to fire (1-indexed) */
  startRound: number;
  /** Number of rounds between activations */
  interval: number;
}

/**
 * Weapon fires on specific rounds only
 *
 * Example: rounds [2, 5, 8, 11, 14]
 */
export interface SpecificRoundsSchedule {
  type: 'specific_rounds';
  /** Exact rounds when weapon fires (1-indexed) */
  rounds: number[];
}
