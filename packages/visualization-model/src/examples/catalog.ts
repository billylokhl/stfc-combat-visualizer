import type { Ship } from '@stfc-vi/ship-model';
import { augur as augurShip } from '@stfc-vi/combat-model/examples/augur';
import { vengeance as vengeanceShip } from '@stfc-vi/combat-model/examples/vengeance';
import { kelvin as kelvinShip } from '@stfc-vi/combat-model/examples/kelvin';
import { augurVisualConfig, augurHardpoints, augurVisualDefinition } from './augur-visual';
import { vengeanceVisualDefinition } from './vengeance-visual';
import { kelvinVisualDefinition } from './kelvin-visual';
import type { ShipVisualDefinition } from '../index';

/**
 * Verification status for ship data.
 *
 * - verified: Data confirmed against battle logs or authoritative STFC source data
 * - unverified: Data present but not validated against evidence
 * - placeholder: Minimal data for structural validation only
 */
export type VerificationStatus = 'verified' | 'unverified' | 'placeholder';

export interface ShipCatalogEntry {
  id: string;
  name: string;
  ship?: Ship; // domain ship (optional for placeholders)
  visual?: ShipVisualDefinition; // visualization definition (optional)
  verificationStatus: VerificationStatus;
  notes?: string;
}

const CATALOG: ShipCatalogEntry[] = [
  {
    id: 'augur',
    name: 'Augur',
    ship: augurShip,
    visual: augurVisualDefinition,
    verificationStatus: 'unverified',
    notes: 'Weapon timing derived from testing but not verified against battle logs.',
  },
  {
    id: 'vengeance',
    name: 'Vengeance',
    ship: vengeanceShip,
    visual: vengeanceVisualDefinition,
    verificationStatus: 'unverified',
    notes: 'Weapon timing approximations derived from earlier analysis. Requires battle log verification.',
  },
  {
    id: 'kelvin',
    name: 'Kelvin',
    ship: kelvinShip,
    visual: kelvinVisualDefinition,
    verificationStatus: 'unverified',
    notes: 'Timing values are approximations intended to validate catalog support.',
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
