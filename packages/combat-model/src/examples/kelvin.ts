import type { Ship } from '@stfc-vi/ship-model';

/**
 * Kelvin Ship Definition
 *
 * Notes / Assumptions:
 * - Timing values sourced from stfc.space/ships/711428193 (source_extract).
 * - Kelvin has 3 weapons: 1 Phaser Turrets (energy) and 2 Photon Torpedoes (kinetic).
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
      name: 'Phaser Turrets',
      type: 'beam',
      hardpoint: 'kelvin_phaser_hp',
      damageType: 'energy',
      averageDamage: 2500,
      warmup: 1,
      cooldown: 1,
      shots: 2,
    },
    {
      id: 'kelvin_photon1',
      name: 'Photon Torpedo I',
      type: 'torpedo',
      hardpoint: 'kelvin_photon1_hp',
      damageType: 'kinetic',
      averageDamage: 9000,
      warmup: 2,
      cooldown: 2,
      shots: 3,
    },
    {
      id: 'kelvin_photon2',
      name: 'Photon Torpedo II',
      type: 'torpedo',
      hardpoint: 'kelvin_photon2_hp',
      damageType: 'kinetic',
      averageDamage: 9000,
      warmup: 2,
      cooldown: 2,
      shots: 3,
    },
  ],
};
