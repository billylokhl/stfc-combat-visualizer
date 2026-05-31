/**
 * Augur Sample Ship Definition
 *
 * This is a reference implementation demonstrating the combat event model
 * using the Augur's firing pattern as an example.
 *
 * Approximate Firing Pattern:
 * - Left Beam: 2 shots every round
 * - Right Beam: 2 shots every round
 * - Obliterator: 1 shot on rounds 2, 5, 8, 11, 14 (every 3 rounds starting round 2)
 */

import type { Ship } from '@stfc-vi/ship-model';

export const augur: Ship = {
  id: 'augur',
  name: 'Augur',
  classification: 'Battleship',
  faction: 'Federation',
  tier: 9,

  weapons: [
    {
      id: 'left_beam',
      name: 'Left Beam',
      hardpoint: 'left_beam',
      damageType: 'energy',
      averageDamage: 5000,
      shotsPerActivation: 2,
      firingSchedule: {
        type: 'every_round',
      },
    },
    {
      id: 'right_beam',
      name: 'Right Beam',
      hardpoint: 'right_beam',
      damageType: 'energy',
      averageDamage: 5000,
      shotsPerActivation: 2,
      firingSchedule: {
        type: 'every_round',
      },
    },
    {
      id: 'obliterator',
      name: 'Obliterator',
      hardpoint: 'obliterator',
      damageType: 'energy',
      averageDamage: 15000,
      shotsPerActivation: 1,
      firingSchedule: {
        type: 'interval',
        startRound: 2,
        interval: 3,
      },
    },
  ],
};
