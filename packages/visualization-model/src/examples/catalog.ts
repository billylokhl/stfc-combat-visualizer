import type { Ship } from '@stfc-vi/ship-model';
import { augur as augurShip } from '@stfc-vi/combat-model/examples';
import { augurVisualConfig, augurHardpoints, augurVisualDefinition } from './augur-visual';
import { vengeanceVisualDefinition } from './vengeance-visual';
import { kelvinVisualDefinition } from './kelvin-visual';
import type { ShipVisualDefinition } from '../index';

export interface ShipCatalogEntry {
  id: string;
  name: string;
  ship?: Ship; // domain ship (optional for placeholders)
  visual?: ShipVisualDefinition; // visualization definition (optional)
  notes?: string;
}

const CATALOG: ShipCatalogEntry[] = [
  {
    id: 'augur',
    name: 'Augur',
    ship: augurShip,
    visual: augurVisualDefinition,
    notes: 'Canonical Augur entry providing domain ship and visual definition.',
  },
  {
    id: 'vengeance',
    name: 'Vengeance (placeholder)',
    visual: vengeanceVisualDefinition,
    notes: 'Placeholder visual definition; domain ship not yet provided.',
  },
  {
    id: 'kelvin',
    name: 'Kelvin (placeholder)',
    visual: kelvinVisualDefinition,
    notes: 'Placeholder visual definition; domain ship not yet provided.',
  },
];

export function listShips(): ShipCatalogEntry[] {
  return CATALOG.slice();
}

export function getShipById(id: string): ShipCatalogEntry | undefined {
  return CATALOG.find((e) => e.id === id);
}

export default {
  listShips,
  getShipById,
};
