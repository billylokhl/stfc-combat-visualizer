/**
 * Augur Visual Configuration
 *
 * Hardpoint definitions and visual configuration for the Augur ship.
 */

import type { HardpointDefinition, ShipVisualConfig } from '../index';
import { augur } from '@stfc-vi/combat-model/examples';

/**
 * Augur hardpoint definitions
 *
 * Defines the physical layout of weapon hardpoints for rendering.
 */
export const augurHardpoints: HardpointDefinition[] = [
  {
    id: 'left_beam',
    name: 'Left Beam Array',
    position: 'left',
    weaponType: 'beam',
  },
  {
    id: 'right_beam',
    name: 'Right Beam Array',
    position: 'right',
    weaponType: 'beam',
  },
  {
    id: 'obliterator',
    name: 'Obliterator Cannon',
    position: 'center',
    weaponType: 'special',
  },
];

/**
 * Complete Augur visual configuration
 */
export const augurVisualConfig: ShipVisualConfig = {
  ship: augur,
  hardpoints: augurHardpoints,
};
