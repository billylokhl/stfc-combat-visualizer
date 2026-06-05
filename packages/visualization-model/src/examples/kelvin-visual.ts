import type { ShipVisualDefinition } from '../index';

export const kelvinVisualDefinition: ShipVisualDefinition = {
  shipId: 'kelvin',
  displayName: 'Kelvin',
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
      spriteCoords: { nx: 0.5, ny: 0.46 },
      weaponType: 'beam',
    },
    {
      id: 'kelvin_photon1_hp',
      weaponId: 'kelvin_photon1',
      name: 'Photon Torpedo Launcher I',
      label: 'PT1',
      position: 'left',
      location: { x: -20, y: 25 },
      spriteCoords: { nx: 0.63, ny: 0.56 },
      weaponType: 'torpedo',
    },
    {
      id: 'kelvin_photon2_hp',
      weaponId: 'kelvin_photon2',
      name: 'Photon Torpedo Launcher II',
      label: 'PT2',
      position: 'right',
      location: { x: 20, y: 25 },
      spriteCoords: { nx: 0.37, ny: 0.56 },
      weaponType: 'torpedo',
    },
  ],
  metadata: { classification: 'Cruiser' },
};
