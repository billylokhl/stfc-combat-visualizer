import type { ShipVisualDefinition } from '../index';

// Placeholder visual definition for Vengeance
// NOTE: Placeholder — hardpoint positions are placeholder estimates; not derived from game assets.
export const vengeanceVisualDefinition: ShipVisualDefinition = {
  shipId: 'vengeance',
  displayName: 'Vengeance (placeholder)',
  hull: {
    shape: 'rectangle',
    width: 160,
    height: 160,
    label: 'VENGEANCE',
  },
  imagePath: 'u-s-s-vengeance.png',
  hardpoints: [
    {
      id: 'vengeance_photon_hp',
      weaponId: 'vengeance_photon',
      name: 'Photon Torpedo Bay',
      label: 'PT',
      position: 'center',
      location: { x: 0, y: -35 },
      weaponType: 'torpedo',
    },
    {
      id: 'vengeance_phaser_hp',
      weaponId: 'vengeance_phaser',
      name: 'Phaser Bank',
      label: 'PH',
      position: 'left',
      location: { x: -50, y: -15 },
      weaponType: 'beam',
    },
    {
      id: 'vengeance_pulse_hp',
      weaponId: 'vengeance_pulse',
      name: 'Pulse Phaser',
      label: 'PP',
      position: 'right',
      location: { x: 50, y: -15 },
      weaponType: 'beam',
    },
    {
      id: 'vengeance_quantum_hp',
      weaponId: 'vengeance_quantum',
      name: 'Quantum Torpedo Bay',
      label: 'QT',
      position: 'center',
      location: { x: 0, y: 35 },
      weaponType: 'torpedo',
    },
  ],
  metadata: { classification: 'Battleship' },
};
