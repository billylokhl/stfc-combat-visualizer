/**
 * Vengeance Validation Example
 *
 * Expected firing patterns based on hypothetical warmup/cooldown/shots values.
 * Observed data is PLACEHOLDER - needs real battle-log evidence.
 */

import type { ShipSourceData, ObservedFiringPattern } from '../types';

/**
 * Vengeance source data (HYPOTHETICAL - not extracted from stfc.space)
 */
export const vengeanceSourceData: ShipSourceData = {
  shipId: 'vengeance',
  shipName: 'Vengeance',
  weapons: [
    {
      weaponId: 'vengeance_photon',
      weaponName: 'Photon Torpedo',
      warmup: 1,
      cooldown: 2,
      shots: 1,
    },
    {
      weaponId: 'vengeance_phaser',
      weaponName: 'Phaser Bank',
      warmup: 1,
      cooldown: 1,
      shots: 3,
    },
    {
      weaponId: 'vengeance_pulse',
      weaponName: 'Pulse Phaser',
      warmup: 2,
      cooldown: 2,
      shots: 2,
    },
    {
      weaponId: 'vengeance_quantum',
      weaponName: 'Quantum Torpedo',
      warmup: 4,
      cooldown: 4,
      shots: 1,
    },
  ],
  source: 'HYPOTHETICAL - firing-pattern-analysis.md assumptions',
};

/**
 * Observed patterns (PLACEHOLDER - needs real battle-log data)
 */
export const vengeancePhotonObserved: ObservedFiringPattern | null = null;
export const vengeancePhaserObserved: ObservedFiringPattern | null = null;
export const vengeancePulseObserved: ObservedFiringPattern | null = null;
export const vengeanceQuantumObserved: ObservedFiringPattern | null = null;
