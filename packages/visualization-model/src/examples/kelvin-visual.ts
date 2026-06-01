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
      id: 'kelvin_phaser_hp',
      weaponId: 'kelvin_phaser1',
      name: 'Phaser Turrets',
      label: 'P',
      position: 'left',
      location: { x: -40, y: 0 },
      // placeholder: converted from location; not calibrated against sprite
      spriteCoords: { nx: 0.23, ny: 0.50 },
      weaponType: 'beam',
    },
    {
      id: 'kelvin_photon1_hp',
      weaponId: 'kelvin_photon1',
      name: 'Photon Torpedo Launcher I',
      label: 'PT1',
      position: 'left',
      location: { x: -20, y: 25 },
      // placeholder: converted from location; not calibrated against sprite
      spriteCoords: { nx: 0.37, ny: 0.67 },
      weaponType: 'torpedo',
    },
    {
      id: 'kelvin_photon2_hp',
      weaponId: 'kelvin_photon2',
      name: 'Photon Torpedo Launcher II',
      label: 'PT2',
      position: 'right',
      location: { x: 20, y: 25 },
      // placeholder: converted from location; not calibrated against sprite
      spriteCoords: { nx: 0.63, ny: 0.67 },
      weaponType: 'torpedo',
    },
  ],
  metadata: { classification: 'Cruiser' },
};
