/**
 * Combat Model
 *
 * Combat mechanics and event generation.
 * No UI code. No animation code.
 */

import type { Ship, WeaponDefinition, FiringSchedule } from '@stfc-vi/ship-model';

/**
 * Represents a combat action occurring in a specific round.
 *
 * Combat events are the canonical interface between combat logic and visual rendering.
 */
export interface CombatEvent {
  /** Event type identifier */
  type: 'weapon_fired' | 'round_start' | 'round_end';

  /** Combat round (1-indexed) */
  round: number;

  /** Weapon ID (for weapon_fired events) */
  weaponId?: string;

  /** Weapon name (for weapon_fired events) */
  weaponName?: string;

  /** Number of shots fired (for weapon_fired events) */
  shots?: number;
}

/**
 * Round summary containing all events for a specific round
 */
export interface RoundEvents {
  /** Round number (1-indexed) */
  round: number;

  /** All events that occur in this round */
  events: CombatEvent[];
}

/**
 * Determine if a weapon fires on a specific round based on its firing schedule
 */
export function weaponFiresOnRound(schedule: FiringSchedule, round: number): boolean {
  switch (schedule.type) {
    case 'every_round':
      return true;

    case 'interval':
      if (round < schedule.startRound) {
        return false;
      }
      return (round - schedule.startRound) % schedule.interval === 0;

    case 'specific_rounds':
      return schedule.rounds.includes(round);

    default:
      return false;
  }
}

/**
 * Generate combat events for a specific round
 *
 * @param ship - The ship definition
 * @param round - Round number (1-indexed)
 * @returns Array of combat events for this round
 */
export function generateRoundEvents(ship: Ship, round: number): CombatEvent[] {
  const events: CombatEvent[] = [];

  // Round start event
  events.push({
    type: 'round_start',
    round,
  });

  // Check each weapon
  if (ship.weapons) {
    for (const weapon of ship.weapons) {
      if (weaponFiresOnRound(weapon.firingSchedule, round)) {
        events.push({
          type: 'weapon_fired',
          round,
          weaponId: weapon.id,
          weaponName: weapon.name,
          shots: weapon.shotsPerActivation,
        });
      }
    }
  }

  // Round end event
  events.push({
    type: 'round_end',
    round,
  });

  return events;
}

/**
 * Generate events for multiple rounds
 *
 * @param ship - The ship definition
 * @param startRound - First round (1-indexed)
 * @param endRound - Last round (inclusive, 1-indexed)
 * @returns Array of round event summaries
 */
export function generateCombatEvents(
  ship: Ship,
  startRound: number,
  endRound: number
): RoundEvents[] {
  const rounds: RoundEvents[] = [];

  for (let round = startRound; round <= endRound; round++) {
    rounds.push({
      round,
      events: generateRoundEvents(ship, round),
    });
  }

  return rounds;
}
