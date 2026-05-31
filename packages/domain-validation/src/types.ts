/**
 * Domain Validation Types
 *
 * Framework for comparing expected vs. observed firing patterns.
 */

/**
 * Source data for a weapon (from stfc.space or similar)
 */
export interface WeaponSourceData {
  weaponId: string;
  weaponName?: string;
  warmup: number; // seconds before first fire
  cooldown: number; // seconds between fires
  shots: number; // projectiles per activation
}

/**
 * Ship source data with all weapons
 */
export interface ShipSourceData {
  shipId: string;
  shipName: string;
  weapons: WeaponSourceData[];
  source: string; // "stfc.space 2026-05-30" or similar
}

/**
 * Expected firing pattern derived from warmup/cooldown/shots
 */
export interface ExpectedFiringPattern {
  weaponId: string;
  rounds: number[]; // rounds in which weapon fires (e.g., [1, 2, 3, 5, 8])
  shotsPerFiring: number; // shots per activation
  derivationMethod: string; // "warmup/cooldown algorithm" or similar
}

/**
 * Observed firing pattern from battle logs
 */
export interface ObservedFiringPattern {
  weaponId: string;
  rounds: number[]; // rounds in which weapon was observed firing
  shotsPerFiring?: number; // shots per activation (may not be observable)
  source: string; // "Player screenshot PvE 2026-05-30" or similar
  confidence: 'high' | 'medium' | 'low'; // observer confidence in data accuracy
  notes?: string; // any observations or caveats
}

/**
 * Comparison result between expected and observed patterns
 */
export interface ValidationResult {
  weaponId: string;
  matches: boolean;
  differences: string[]; // human-readable list of differences
  expected: ExpectedFiringPattern;
  observed: ObservedFiringPattern | null; // null if no observed data available
}

/**
 * Ship-level validation report
 */
export interface ShipValidationReport {
  shipId: string;
  shipName: string;
  sourceData: ShipSourceData;
  weaponResults: ValidationResult[];
  overallStatus: 'validated' | 'partial' | 'unvalidated' | 'failed';
  summary: string;
}

/**
 * Assumption validation status
 */
export interface AssumptionValidation {
  assumptionId: string; // e.g., "ASSUMPTION-001"
  description: string;
  validatedShips: string[]; // ship IDs that validate this assumption
  failedShips: string[]; // ship IDs that contradict this assumption
  status: 'confirmed' | 'partially-confirmed' | 'contradicted' | 'untested';
  confidence: number; // 0-100
  lastUpdated: string; // ISO date
}
