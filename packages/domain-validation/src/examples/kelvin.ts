/**
 * Kelvin Validation Example
 *
 * Expected firing patterns based on hypothetical warmup/cooldown/shots values.
 * Observed data is PLACEHOLDER - needs real battle-log evidence.
 */

import type { ShipSourceData, ObservedFiringPattern } from '../types';

/**
 * Kelvin source data (extracted from stfc.space/ships/711428193)
 * 3 weapons: 1 Phaser Turrets (energy), 2 Photon Torpedoes (kinetic)
 */
export const kelvinSourceData: ShipSourceData = {
  shipId: 'kelvin',
  shipName: 'Kelvin',
  weapons: [
    {
      weaponId: 'kelvin_phaser1',
      weaponName: 'Phaser Turrets',
      warmup: 1,
      cooldown: 1,
      shots: 2,
    },
    {
      weaponId: 'kelvin_photon1',
      weaponName: 'Photon Torpedo I',
      warmup: 2,
      cooldown: 2,
      shots: 3,
    },
    {
      weaponId: 'kelvin_photon2',
      weaponName: 'Photon Torpedo II',
      warmup: 2,
      cooldown: 2,
      shots: 3,
    },
  ],
  source: 'stfc.space/ships/711428193 (source_extract)',
};

/**
 * Observed patterns (PLACEHOLDER - needs real battle-log data)
 */
export const kelvinPhaser1Observed: ObservedFiringPattern | null = null;
export const kelvinPhoton1Observed: ObservedFiringPattern | null = null;
export const kelvinPhoton2Observed: ObservedFiringPattern | null = null;
