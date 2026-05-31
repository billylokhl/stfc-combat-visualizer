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

  /** Weapon timing information */
  timing?: {
    /** Cooldown in seconds */
    cooldown?: number;

    /** Initial delay before first firing */
    initialDelay?: number;
  };
}

/**
 * Firing pattern definition
 */
export interface FiringPattern {
  /** Pattern identifier */
  id: string;

  /** Pattern name/description */
  name: string;

  /** Weapon IDs involved in this pattern */
  weaponIds: string[];

  /** Pattern timing and sequence information */
  sequence?: unknown;
}
