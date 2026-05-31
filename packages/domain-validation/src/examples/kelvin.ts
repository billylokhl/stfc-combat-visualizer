/**
 * Kelvin Validation Example
 *
 * Expected firing patterns based on hypothetical warmup/cooldown/shots values.
 * Observed data is PLACEHOLDER - needs real battle-log evidence.
 */

import type { ShipSourceData, ObservedFiringPattern } from '../types';

/**
 * Kelvin source data (HYPOTHETICAL - not extracted from stfc.space)
 */
export const kelvinSourceData: ShipSourceData = {
  shipId: 'kelvin',
  shipName: 'Kelvin',
  weapons: [
    {
      weaponId: 'kelvin_phaser1',
      weaponName: 'Phaser Beam (1)',
      warmup: 0,
      cooldown: 1,
      shots: 2,
    },
    {
      weaponId: 'kelvin_phaser2',
      weaponName: 'Phaser Beam (2)',
      warmup: 0,
      cooldown: 1,
      shots: 2,
    },
    {
      weaponId: 'kelvin_kinetic',
      weaponName: 'Kinetic Torpedo',
      warmup: 1,
      cooldown: 2,
      shots: 1,
    },
    {
      weaponId: 'kelvin_photon',
      weaponName: 'Photon Torpedo',
      warmup: 2,
      cooldown: 3,
      shots: 1,
    },
  ],
  source: 'HYPOTHETICAL - firing-pattern-analysis.md assumptions',
};

/**
 * Observed patterns (PLACEHOLDER - needs real battle-log data)
 */
export const kelvinPhaser1Observed: ObservedFiringPattern | null = null;
export const kelvinPhaser2Observed: ObservedFiringPattern | null = null;
export const kelvinKineticObserved: ObservedFiringPattern | null = null;
export const kelvinPhotonObserved: ObservedFiringPattern | null = null;
