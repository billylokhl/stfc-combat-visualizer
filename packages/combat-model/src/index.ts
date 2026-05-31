/**
 * Combat Model
 *
 * Combat mechanics and event generation.
 * No UI code. No animation code.
 */

import type { Ship, WeaponDefinition } from '@stfc-vi/ship-model';

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
 * Determine if a weapon fires on a specific round based on warmup/cooldown timing
 *
 * Algorithm:
 * 1. First firing round = 1 + warmup
 * 2. Weapon fires if: round == firstRound OR (round - firstRound) % cooldown == 0
 *
 * Examples:
 * - warmup=0, cooldown=1: fires rounds 1,2,3,4,5... (every round)
 * - warmup=1, cooldown=3: fires rounds 2,5,8,11,14... (every 3 rounds starting round 2)
 * - warmup=2, cooldown=2: fires rounds 3,5,7,9,11... (every 2 rounds starting round 3)
 */
export function weaponFiresOnRound(weapon: WeaponDefinition, round: number): boolean {
  const firstRound = 1 + weapon.warmup;

  if (round < firstRound) {
    return false;
  }

  if (round === firstRound) {
    return true;
  }

  return (round - firstRound) % weapon.cooldown === 0;
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
      if (weaponFiresOnRound(weapon, round)) {
        events.push({
          type: 'weapon_fired',
          round,
          weaponId: weapon.id,
          weaponName: weapon.name,
          shots: weapon.shots,
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
