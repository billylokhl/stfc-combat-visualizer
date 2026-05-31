/**
 * Augur Visual Configuration
 *
 * Hardpoint definitions and visual configuration for the Augur ship.
 */

import type { HardpointDefinition, ShipVisualDefinition } from '../index';

/**
 * Complete Augur visual definition
 *
 * This is visualization data only. Weapon timing remains in combat-model.
 */
export const augurVisualDefinition: ShipVisualDefinition = {
  shipId: 'augur',
  displayName: 'Augur',
  hull: {
    shape: 'rectangle',
    width: 100,
    height: 60,
    label: 'AUGUR',
  },
  hardpoints: [
    {
      id: 'augur_left_beam_hp',
      weaponId: 'left_beam',
      name: 'Left Beam Array',
      label: 'L',
      position: 'left',
      location: { x: -60, y: 0 },
      weaponType: 'beam',
    },
    {
      id: 'augur_right_beam_hp',
      weaponId: 'right_beam',
      name: 'Right Beam Array',
      label: 'R',
      position: 'right',
      location: { x: 60, y: 0 },
      weaponType: 'beam',
    },
    {
      id: 'augur_obliterator_hp',
      weaponId: 'obliterator',
      name: 'Obliterator Cannon',
      label: 'O',
      position: 'center',
      location: { x: 0, y: -40 },
      weaponType: 'torpedo',
    },
  ],
  metadata: {
    classification: 'Battleship',
    faction: 'Federation',
  },
};

/**
 * Augur hardpoint definitions
 *
 * Defines the physical layout of weapon hardpoints for rendering.
 */
export const augurHardpoints: HardpointDefinition[] =
  augurVisualDefinition.hardpoints;

/**
 * Backwards-compatible alias for early milestone demos.
 */
export const augurVisualConfig = augurVisualDefinition;
