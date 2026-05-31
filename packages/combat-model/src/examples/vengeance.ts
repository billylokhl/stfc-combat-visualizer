import type { Ship } from '@stfc-vi/ship-model';

/**
 * Vengeance Ship Definition
 *
 * Notes / Assumptions:
 * - Weapon timing (warmup/cooldown/shots) are approximations derived from
 *   earlier analysis and community references. They should be verified against
 *   battle logs for production accuracy.
 * - Hardpoint ids chosen to match visualization placeholders in
 *   visualization-model/examples/vengeance-visual.ts
 */
export const vengeance: Ship = {
  id: 'vengeance',
  name: 'Vengeance',
  classification: 'Battleship',
  faction: 'Federation',
  tier: 10,
  weapons: [
    {
      id: 'vengeance_photon',
      name: 'Photon Torpedo',
      type: 'torpedo',
      hardpoint: 'vengeance_front_hp',
      damageType: 'kinetic',
      averageDamage: 12000,
      warmup: 1,
      cooldown: 3,
      shots: 1,
    },
    {
      id: 'vengeance_phaser',
      name: 'Phaser Bank',
      type: 'beam',
      hardpoint: 'vengeance_front_hp',
      damageType: 'energy',
      averageDamage: 4000,
      warmup: 1,
      cooldown: 1,
      shots: 3,
    },
    {
      id: 'vengeance_pulse',
      name: 'Pulse Phaser',
      type: 'beam',
      hardpoint: 'vengeance_front_hp',
      damageType: 'energy',
      averageDamage: 3000,
      warmup: 2,
      cooldown: 2,
      shots: 2,
    },
    {
      id: 'vengeance_quantum',
      name: 'Quantum Torpedo',
      type: 'torpedo',
      hardpoint: 'vengeance_front_hp',
      damageType: 'special',
      averageDamage: 20000,
      warmup: 4,
      cooldown: 4,
      shots: 1,
    },
  ],
};
