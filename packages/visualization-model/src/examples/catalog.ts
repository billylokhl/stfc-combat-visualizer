import type { Ship } from '@stfc-vi/ship-model';
import { augur as augurShip } from '@stfc-vi/combat-model/examples/augur';
import { vengeance as vengeanceShip } from '@stfc-vi/combat-model/examples/vengeance';
import { kelvin as kelvinShip } from '@stfc-vi/combat-model/examples/kelvin';
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
    name: 'Vengeance',
    ship: vengeanceShip,
    visual: vengeanceVisualDefinition,
    notes: 'Vengeance ship definition added to catalog (timing values are approximate, see file for assumptions).',
  },
  {
    id: 'kelvin',
    name: 'Kelvin',
    ship: kelvinShip,
    visual: kelvinVisualDefinition,
    notes: 'Kelvin ship definition added to catalog (timing values are approximate, see file for assumptions).',
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
