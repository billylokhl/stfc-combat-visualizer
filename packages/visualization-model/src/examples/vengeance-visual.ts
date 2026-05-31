import type { ShipVisualDefinition } from '../index';

// Placeholder visual definition for Vengeance
// NOTE: Placeholder — visual details should be refined later.
export const vengeanceVisualDefinition: ShipVisualDefinition = {
  shipId: 'vengeance',
  displayName: 'Vengeance (placeholder)',
  hull: {
    shape: 'rectangle',
    width: 120,
    height: 70,
    label: 'VENGEANCE',
  },
  hardpoints: [
    {
      id: 'vengeance_front_hp',
      weaponId: 'vengeance_front',
      name: 'Front Hardpoint',
      label: 'F',
      position: 'center',
      location: { x: 0, y: -30 },
      weaponType: 'beam',
    },
  ],
  metadata: { classification: 'Battleship' },
};
