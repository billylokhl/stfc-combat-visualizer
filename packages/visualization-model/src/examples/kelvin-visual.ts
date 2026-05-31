import type { ShipVisualDefinition } from '../index';

// Placeholder visual definition for Kelvin
// NOTE: Placeholder — visual details should be refined later.
export const kelvinVisualDefinition: ShipVisualDefinition = {
  shipId: 'kelvin',
  displayName: 'Kelvin (placeholder)',
  hull: {
    shape: 'rectangle',
    width: 90,
    height: 50,
    label: 'KELVIN',
  },
  hardpoints: [
    {
      id: 'kelvin_left_hp',
      weaponId: 'kelvin_phaser1',
      name: 'Left Hardpoint',
      label: 'L',
      position: 'left',
      location: { x: -40, y: 0 },
      weaponType: 'beam',
    },
    {
      id: 'kelvin_right_hp',
      weaponId: 'kelvin_phaser2',
      name: 'Right Hardpoint',
      label: 'R',
      position: 'right',
      location: { x: 40, y: 0 },
      weaponType: 'beam',
    },
  ],
  metadata: { classification: 'Cruiser' },
};
