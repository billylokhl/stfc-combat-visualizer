/**
 * Asset Library
 *
 * Visual assets and metadata.
 * No business logic.
 */

/**
 * Ship visual asset metadata
 */
export interface ShipAsset {
  /** Ship ID this asset represents */
  shipId: string;

  /** Path to ship image */
  imagePath: string;

  /** Asset metadata */
  metadata?: {
    width?: number;
    height?: number;
    scale?: number;
  };
}

/**
 * Visual effect definition
 */
export interface EffectDefinition {
  /** Effect identifier */
  id: string;

  /** Effect type (e.g., "projectile", "explosion", "beam") */
  type: string;

  /** Effect assets */
  assets?: {
    imagePath?: string;
    animationData?: unknown;
  };
}

/**
 * Placeholder export for asset registry
 */
export const AssetRegistry = {
  // Asset management functionality will be implemented here
};
