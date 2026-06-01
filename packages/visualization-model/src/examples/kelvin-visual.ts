import type { ShipVisualDefinition } from '../index';

// Placeholder visual definition for Kelvin
// NOTE: Placeholder — hardpoint positions are placeholder estimates; not derived from game assets.
export const kelvinVisualDefinition: ShipVisualDefinition = {
  shipId: 'kelvin',
  displayName: 'Kelvin (placeholder)',
  hull: {
    shape: 'rectangle',
    width: 150,
    height: 150,
    label: 'KELVIN',
  },
  imagePath: 'u-s-s-kelvin.png',
  hardpoints: [
    {
      id: 'kelvin_left_hp',
      weaponId: 'kelvin_phaser1',
      name: 'Left Beam Emitter',
      label: 'L',
      position: 'left',
      location: { x: -40, y: 0 },
      weaponType: 'beam',
    },
    {
      id: 'kelvin_right_hp',
      weaponId: 'kelvin_phaser2',
      name: 'Right Beam Emitter',
      label: 'R',
      position: 'right',
      location: { x: 40, y: 0 },
      weaponType: 'beam',
    },
    {
      id: 'kelvin_kinetic_hp',
      weaponId: 'kelvin_kinetic',
      name: 'Kinetic Torpedo Launcher',
      label: 'KT',
      position: 'left',
      location: { x: -20, y: 25 },
      weaponType: 'torpedo',
    },
    {
      id: 'kelvin_photon_hp',
      weaponId: 'kelvin_photon',
      name: 'Photon Torpedo Launcher',
      label: 'PT',
      position: 'right',
      location: { x: 20, y: 25 },
      weaponType: 'torpedo',
    },
  ],
  metadata: { classification: 'Cruiser' },
};
