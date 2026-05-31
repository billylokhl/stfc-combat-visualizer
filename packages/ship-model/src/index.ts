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

/** Minimal FiringPattern marker type used for provenance/validation scaffolding.
 * Kept intentionally minimal — details belong in domain-validation package.
 */
export interface FiringPattern {
  // placeholder for structured firing pattern metadata
}

/**
 * Weapon type classification
 */
export type WeaponType = 'beam' | 'torpedo' | 'kinetic' | 'energy' | 'special';

/**
 * Weapon definition on a ship
 *
 * Timing model based on STFC source data (stfc.space):
 * - warmup: rounds of delay before weapon can first fire
 * - cooldown: rounds of delay between weapon activations
 * - shots: number of projectiles fired per activation
 */
export interface WeaponDefinition {
  /** Weapon identifier */
  id: string;

  /** Weapon display name */
  name: string;

  /** Weapon type classification */
  type: WeaponType;

  /** Hardpoint assignment (e.g., "left_beam", "right_beam", "obliterator") */
  hardpoint: string;

  /** Damage type (e.g., "kinetic", "energy") */
  damageType?: string;

  /** Average damage value */
  averageDamage?: number;

  /**
   * Warmup: Number of rounds before weapon can first fire
   *
   * Examples:
   * - warmup = 0: weapon fires starting round 1
   * - warmup = 1: weapon fires starting round 2
   * - warmup = 2: weapon fires starting round 3
   */
  warmup: number;

  /**
   * Cooldown: Number of rounds between weapon activations
   *
   * Examples:
   * - cooldown = 1: weapon fires every round
   * - cooldown = 2: weapon fires every 2 rounds
   * - cooldown = 3: weapon fires every 3 rounds
   */
  cooldown: number;

  /**
   * Shots: Number of projectiles fired per activation
   *
   * Examples:
   * - shots = 1: single projectile per activation
   * - shots = 2: burst of 2 projectiles per activation
   * - shots = 3: burst of 3 projectiles per activation
   */
  shots: number;
}
