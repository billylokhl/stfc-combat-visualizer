/**
 * Augur Sample Ship Definition
 *
 * This is a reference implementation demonstrating the combat event model
 * using the Augur's firing pattern as an example.
 *
 * Firing Pattern (warmup/cooldown/shots):
 * - Left Beam: warmup=0, cooldown=1, shots=2 → fires rounds 1,2,3,4,5...
 * - Right Beam: warmup=0, cooldown=1, shots=2 → fires rounds 1,2,3,4,5...
 * - Obliterator: warmup=1, cooldown=3, shots=1 → fires rounds 2,5,8,11,14...
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
      type: 'beam',
      hardpoint: 'left_beam',
      damageType: 'energy',
      averageDamage: 5000,
      warmup: 0,
      cooldown: 1,
      shots: 2,
    },
    {
      id: 'right_beam',
      name: 'Right Beam',
      type: 'beam',
      hardpoint: 'right_beam',
      damageType: 'energy',
      averageDamage: 5000,
      warmup: 0,
      cooldown: 1,
      shots: 2,
    },
    {
      id: 'obliterator',
      name: 'Obliterator',
      type: 'torpedo',
      hardpoint: 'obliterator',
      damageType: 'energy',
      averageDamage: 15000,
      warmup: 1,
      cooldown: 3,
      shots: 1,
    },
  ],
};
