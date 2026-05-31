import type { Ship } from '@stfc-vi/ship-model';

/**
 * Kelvin Ship Definition
 *
 * Notes / Assumptions:
 * - Timing values are approximations intended to validate catalog support.
 * - Visual hardpoint ids chosen to match placeholders in visualization examples.
 */
export const kelvin: Ship = {
  id: 'kelvin',
  name: 'Kelvin',
  classification: 'Cruiser',
  faction: 'Federation',
  tier: 7,
  weapons: [
    {
      id: 'kelvin_phaser1',
      name: 'Phaser Beam I',
      type: 'beam',
      hardpoint: 'kelvin_left_hp',
      damageType: 'energy',
      averageDamage: 2500,
      warmup: 1,
      cooldown: 1,
      shots: 2,
    },
    {
      id: 'kelvin_phaser2',
      name: 'Phaser Beam II',
      type: 'beam',
      hardpoint: 'kelvin_right_hp',
      damageType: 'energy',
      averageDamage: 2500,
      warmup: 1,
      cooldown: 1,
      shots: 2,
    },
    {
      id: 'kelvin_kinetic',
      name: 'Kinetic Torpedo',
      type: 'torpedo',
      hardpoint: 'kelvin_kinetic_hp',
      damageType: 'kinetic',
      averageDamage: 8000,
      warmup: 2,
      cooldown: 2,
      shots: 1,
    },
    {
      id: 'kelvin_photon',
      name: 'Photon Torpedo',
      type: 'torpedo',
      hardpoint: 'kelvin_photon_hp',
      damageType: 'kinetic',
      averageDamage: 10000,
      warmup: 3,
      cooldown: 3,
      shots: 1,
    },
  ],
};
