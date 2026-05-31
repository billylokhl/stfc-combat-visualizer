import type { Ship } from '@stfc-vi/ship-model';
import { augur as augurShip } from '@stfc-vi/combat-model/examples/augur';
import { vengeance as vengeanceShip } from '@stfc-vi/combat-model/examples/vengeance';
import { kelvin as kelvinShip } from '@stfc-vi/combat-model/examples/kelvin';
import { augurVisualDefinition } from './augur-visual';
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

/**
 * Provenance category for timing values (warmup/cooldown/shots).
 * See docs/data-provenance-policy.md for full definitions.
 *
 * - battle_log:     Observed directly in recorded STFC combat
 * - source_extract: Extracted from authoritative external source (stfc.space, etc.)
 * - derived:        Calculated from a documented method; inputs may themselves be approximate
 * - approximation:  Informal estimate based on experience or community knowledge
 * - placeholder:    Structural scaffolding; accuracy not claimed
 * - unknown:        Origin cannot be traced from available documentation
 */
export type ProvenanceCategory =
  | 'battle_log'
  | 'source_extract'
  | 'derived'
  | 'approximation'
  | 'placeholder'
  | 'unknown';

export interface ShipCatalogEntry {
  id: string;
  name: string;
  ship?: Ship; // domain ship (optional for placeholders)
  visual?: ShipVisualDefinition; // visualization definition (optional)
  verificationStatus: VerificationStatus;
  /** Provenance category for weapon timing values. See docs/data-provenance-policy.md. */
  provenanceCategory: ProvenanceCategory;
  notes?: string;
}

const CATALOG: ShipCatalogEntry[] = [
  {
    id: 'augur',
    name: 'Augur',
    ship: augurShip,
    visual: augurVisualDefinition,
    verificationStatus: 'unverified',
    // Provenance: timing values have no documented external source or derivation method.
    // File header describes Augur as a "reference implementation" but cites no origin for
    // specific warmup/cooldown/shots values. Category: unknown.
    provenanceCategory: 'unknown',
    notes: 'Weapon timing has no documented external source. File describes Augur as a reference implementation but does not cite stfc.space, battle logs, or derivation method. Provenance: unknown.',
  },
  {
    id: 'vengeance',
    name: 'Vengeance',
    ship: vengeanceShip,
    visual: vengeanceVisualDefinition,
    verificationStatus: 'unverified',
    // Provenance: file header states "approximations derived from earlier analysis and community
    // references" — this is Category D (approximation) for most values, but the Photon Torpedo
    // cooldown (=3) diverges from all other repository documents without explanation, making its
    // specific origin Unknown (F). Dominant category is approximation.
    provenanceCategory: 'approximation',
    notes: 'Timing values are approximations derived from earlier analysis and community references (not battle-log verified). Photon Torpedo cooldown=3 diverges from hypothetical analysis sources (cooldown=2) without documented explanation. Provenance: approximation (Photon cooldown unknown).',
  },
  {
    id: 'kelvin',
    name: 'Kelvin',
    ship: kelvinShip,
    visual: kelvinVisualDefinition,
    verificationStatus: 'unverified',
    // Provenance: file header explicitly states "approximations intended to validate catalog support".
    // Contributor explicitly acknowledges values are not accurate. Category: approximation.
    provenanceCategory: 'approximation',
    notes: 'Timing values are self-described approximations intended to validate catalog support. No external source or derivation method documented. Provenance: approximation.',
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
