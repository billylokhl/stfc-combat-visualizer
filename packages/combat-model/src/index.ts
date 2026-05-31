/**
 * Combat Model
 *
 * Combat mechanics and event generation.
 * No UI code. No animation code.
 */

import type { Ship, WeaponDefinition } from '@stfc-vi/ship-model';

/**
 * Ship role in combat
 */
export type ShipRole = 'attacker' | 'defender';

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

  /** Ship ID (for two-ship combat) */
  shipId?: string;

  /** Ship role (for two-ship combat) */
  role?: ShipRole;

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
 * 1. First firing round = warmup (warmup is the round number, not a delay)
 * 2. Weapon fires if: round == firstRound OR (round - firstRound) % cooldown == 0
 *
 * Warmup Semantics:
 * - warmup=1 → first activation in round 1
 * - warmup=2 → first activation in round 2
 * - warmup=3 → first activation in round 3
 *
 * Examples:
 * - warmup=1, cooldown=1: fires rounds 1,2,3,4,5... (every round)
 * - warmup=2, cooldown=3: fires rounds 2,5,8,11,14... (every 3 rounds starting round 2)
 * - warmup=3, cooldown=2: fires rounds 3,5,7,9,11... (every 2 rounds starting round 3)
 */
export function weaponFiresOnRound(weapon: WeaponDefinition, round: number): boolean {
  // warmup is the round number when weapon first fires (with fallback to round 1)
  const firstRound = weapon.warmup || 1;

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

/**
 * Generate two-ship combat events with interleaved weapon slot ordering
 *
 * Ordering assumption (accepted for visualization):
 * - Attacker weapon 1 fires
 * - Defender weapon 1 fires
 * - Attacker weapon 2 fires
 * - Defender weapon 2 fires
 * - ... (continue for all weapon slots)
 * - Skip missing weapon slots
 *
 * Example:
 * ```
 * Attacker has 3 weapons, Defender has 2 weapons
 * Round 1:
 *   A-W1 fires
 *   D-W1 fires
 *   A-W2 fires
 *   D-W2 fires
 *   A-W3 fires
 *   (Defender has no W3, skipped)
 * ```
 *
 * @param attacker - Attacking ship
 * @param defender - Defending ship
 * @param rounds - Number of rounds to simulate
 * @returns Array of round event summaries with interleaved weapon ordering
 */
export function generateTwoShipCombat(
  attacker: Ship,
  defender: Ship,
  rounds: number
): RoundEvents[] {
  const results: RoundEvents[] = [];

  for (let round = 1; round <= rounds; round++) {
    const roundEvents: CombatEvent[] = [];

    // Round start
    roundEvents.push({
      type: 'round_start',
      round,
    });

    // Determine max weapon slots (longest weapon array)
    const attackerWeapons = attacker.weapons || [];
    const defenderWeapons = defender.weapons || [];
    const maxSlots = Math.max(attackerWeapons.length, defenderWeapons.length);

    // Interleave weapon fires by slot
    for (let slot = 0; slot < maxSlots; slot++) {
      // Attacker weapon at this slot
      const attackerWeapon = attackerWeapons[slot];
      if (attackerWeapon && weaponFiresOnRound(attackerWeapon, round)) {
        roundEvents.push({
          type: 'weapon_fired',
          round,
          shipId: attacker.id,
          role: 'attacker',
          weaponId: attackerWeapon.id,
          weaponName: attackerWeapon.name,
          shots: attackerWeapon.shots,
        });
      }

      // Defender weapon at this slot
      const defenderWeapon = defenderWeapons[slot];
      if (defenderWeapon && weaponFiresOnRound(defenderWeapon, round)) {
        roundEvents.push({
          type: 'weapon_fired',
          round,
          shipId: defender.id,
          role: 'defender',
          weaponId: defenderWeapon.id,
          weaponName: defenderWeapon.name,
          shots: defenderWeapon.shots,
        });
      }
    }

    // Round end
    roundEvents.push({
      type: 'round_end',
      round,
    });

    results.push({
      round,
      events: roundEvents,
    });
  }

  return results;
}
