/**
 * Visualization Model
 *
 * Transforms combat events into visual timeline events.
 * Framework-agnostic abstraction layer between combat logic and animation.
 * No UI code. No rendering code. No browser dependencies.
 */

import type { Ship, WeaponDefinition } from '@stfc-vi/ship-model';
import type { CombatEvent, RoundEvents } from '@stfc-vi/combat-model';

/**
 * Visual event types that can be rendered by an animation engine
 */
export type VisualEventType =
  | 'muzzle_flash'
  | 'recoil'
  | 'projectile_launch'
  | 'impact'
  | 'round_marker';

/**
 * Represents a visual action at a specific point in time
 *
 * Visual events describe HOW gameplay is presented, not WHAT happens in gameplay.
 * A future renderer consumes these events without understanding STFC combat logic.
 */
export interface VisualEvent {
  /** Type of visual event */
  type: VisualEventType;

  /** Timestamp in milliseconds from round start */
  timestamp: number;

  /** Weapon ID associated with this event */
  weaponId?: string;

  /** Hardpoint identifier from the ship visual definition */
  hardpoint?: string;

  /** Additional event-specific data */
  data?: {
    /** Shot index for multi-shot weapons (0-indexed) */
    shotIndex?: number;
    /** Total shots in burst */
    totalShots?: number;
    /** Round number for round_marker events */
    round?: number;
  };
}

/**
 * Visual state of a weapon for a given combat round.
 *
 * This is presentation state only. Combat timing is derived upstream by combat-model.
 */
export type WeaponVisualStateType = 'charging' | 'firing';

/**
 * Renderer-friendly weapon state for a round.
 */
export interface WeaponVisualState {
  /** Weapon identifier from the ship model */
  weaponId: string;

  /** Hardpoint identifier from the ship visual definition */
  hardpointId: string;

  /** Current visual state */
  state: WeaponVisualStateType;

  /** Combat round (1-indexed) */
  round: number;

  /** Number of shots for this activation when firing */
  shots?: number;

  /** Optional renderer timing hint in milliseconds from round start */
  timestamp?: number;
}

/**
 * Visual timeline for a single round
 */
export interface VisualRoundTimeline {
  /** Round number (1-indexed) */
  round: number;

  /** Ordered visual events for this round */
  events: VisualEvent[];

  /** Per-weapon visual state for this round */
  weaponStates: WeaponVisualState[];

  /** Total duration of this round in milliseconds */
  duration: number;
}

/**
 * Ship hull geometry used by renderers.
 *
 * Values are renderer units centered on the ship origin. Renderers decide how to
 * scale those units to screen coordinates.
 */
export interface ShipHullGeometry {
  /** Minimal supported hull shape for the engineering prototype */
  shape: 'rectangle';

  /** Hull width in visual units */
  width: number;

  /** Hull height in visual units */
  height: number;

  /** Optional short label rendered on the hull */
  label?: string;
}

/**
 * Hardpoint positioning metadata
 *
 * Defines the physical location and properties of weapon hardpoints.
 * This allows a future renderer to know where effects should appear.
 */
export interface HardpointDefinition {
  /** Hardpoint identifier for visual lookup */
  id: string;

  /** Weapon identifier rendered at this hardpoint */
  weaponId: string;

  /** Display name */
  name: string;

  /** Short renderer label */
  label: string;

  /** Position hint for rendering (e.g., 'left', 'right', 'center', 'top') */
  position: 'left' | 'right' | 'center' | 'top' | 'bottom';

  /** Position relative to the ship origin in visual units */
  location: {
    x: number;
    y: number;
  };

  /** Weapon type hint for visual styling */
  weaponType?: 'beam' | 'torpedo' | 'kinetic' | 'energy' | 'special';
}

/**
 * Visualization-layer ship definition.
 *
 * Contains only information required for rendering. It does not contain combat
 * timing, damage, or scheduling rules.
 */
export interface ShipVisualDefinition {
  /** Ship identifier matching the domain ship id */
  shipId: string;

  /** Display name for rendering */
  displayName: string;

  /** Hull geometry for renderers */
  hull: ShipHullGeometry;

  /** Hardpoint definitions for this ship */
  hardpoints: HardpointDefinition[];

  /** Optional visual-only metadata */
  metadata?: {
    classification?: string;
    faction?: string;
  };
}

/** Backwards-compatible alias for early milestone docs and demos. */
export type ShipVisualConfig = ShipVisualDefinition;

/**
 * Timing configuration for visual event generation
 */
export interface VisualTimingConfig {
  /** Delay before muzzle flash (ms) */
  muzzleFlashDelay: number;

  /** Delay before recoil effect (ms) */
  recoilDelay: number;

  /** Delay before projectile launch (ms) */
  projectileLaunchDelay: number;

  /** Delay between shots in a burst (ms) */
  shotInterval: number;

  /** Base delay for weapons by hardpoint type */
  baseDelayByPosition: {
    left: number;
    right: number;
    center: number;
    top: number;
    bottom: number;
  };
}

/**
 * Default timing configuration
 */
export const DEFAULT_TIMING: VisualTimingConfig = {
  muzzleFlashDelay: 50,
  recoilDelay: 0,
  projectileLaunchDelay: 100,
  shotInterval: 50,
  baseDelayByPosition: {
    left: 0,
    right: 200,
    center: 400,
    top: 600,
    bottom: 800,
  },
};

/**
 * Find hardpoint definition for a weapon
 */
function findHardpoint(
  weapon: WeaponDefinition,
  hardpoints: HardpointDefinition[]
): HardpointDefinition | undefined {
  return hardpoints.find(
    (hardpoint) =>
      hardpoint.weaponId === weapon.id || hardpoint.id === weapon.hardpoint
  );
}

/**
 * Resolve hardpoint arrays from either a visual definition or a raw hardpoint list.
 */
function getHardpoints(
  visualDefinitionOrHardpoints: ShipVisualDefinition | HardpointDefinition[]
): HardpointDefinition[] {
  return Array.isArray(visualDefinitionOrHardpoints)
    ? visualDefinitionOrHardpoints
    : visualDefinitionOrHardpoints.hardpoints;
}

/**
 * Derive round-level weapon visual states from combat output.
 *
 * The renderer consumes these states without understanding warmup/cooldown rules.
 */
export function deriveWeaponVisualStates(
  roundEvents: RoundEvents,
  ship: Ship,
  visualDefinitionOrHardpoints: ShipVisualDefinition | HardpointDefinition[]
): WeaponVisualState[] {
  const hardpoints = getHardpoints(visualDefinitionOrHardpoints);
  const firingEvents = new Map<string, CombatEvent>();
  const states: WeaponVisualState[] = [];

  for (const event of roundEvents.events) {
    if (event.type === 'weapon_fired' && event.weaponId) {
      firingEvents.set(event.weaponId, event);
    }
  }

  for (const weapon of ship.weapons || []) {
    const hardpoint = findHardpoint(weapon, hardpoints);
    if (!hardpoint) {
      continue;
    }

    const firingEvent = firingEvents.get(weapon.id);
    const state: WeaponVisualState = {
      weaponId: weapon.id,
      hardpointId: hardpoint.id,
      state: firingEvent ? 'firing' : 'charging',
      round: roundEvents.round,
    };

    if (firingEvent?.shots !== undefined) {
      state.shots = firingEvent.shots;
    }

    if (firingEvent) {
      state.timestamp = 0;
    }

    states.push(state);
  }

  return states;
}

/**
 * Calculate base timing offset for a weapon based on hardpoint position
 */
function calculateBaseOffset(
  hardpoint: HardpointDefinition | undefined,
  config: VisualTimingConfig
): number {
  if (!hardpoint) {
    return 0;
  }
  return config.baseDelayByPosition[hardpoint.position] || 0;
}

/**
 * Transform a weapon_fired combat event into visual events
 *
 * Maps game logic (weapon fired) to presentation (muzzle flash, recoil, projectiles).
 */
function transformWeaponFired(
  event: CombatEvent,
  weapon: WeaponDefinition | undefined,
  hardpoint: HardpointDefinition | undefined,
  config: VisualTimingConfig
): VisualEvent[] {
  if (!weapon || !event.weaponId) {
    return [];
  }

  const visualEvents: VisualEvent[] = [];
  const baseOffset = calculateBaseOffset(hardpoint, config);
  const shots = event.shots || 1;

  // Generate events for each shot
  for (let shotIndex = 0; shotIndex < shots; shotIndex++) {
    const shotOffset = shotIndex * config.shotInterval;

    // Recoil (starts immediately)
    visualEvents.push({
      type: 'recoil',
      timestamp: baseOffset + shotOffset + config.recoilDelay,
      weaponId: event.weaponId,
      hardpoint: hardpoint?.id,
      data: {
        shotIndex,
        totalShots: shots,
      },
    });

    // Muzzle flash (shortly after recoil)
    visualEvents.push({
      type: 'muzzle_flash',
      timestamp: baseOffset + shotOffset + config.muzzleFlashDelay,
      weaponId: event.weaponId,
      hardpoint: hardpoint?.id,
      data: {
        shotIndex,
        totalShots: shots,
      },
    });

    // Projectile launch (after muzzle flash)
    visualEvents.push({
      type: 'projectile_launch',
      timestamp: baseOffset + shotOffset + config.projectileLaunchDelay,
      weaponId: event.weaponId,
      hardpoint: hardpoint?.id,
      data: {
        shotIndex,
        totalShots: shots,
      },
    });
  }

  return visualEvents;
}

/**
 * Transform combat events for a round into visual events
 *
 * @param roundEvents - Combat events for a round
 * @param ship - Ship definition
 * @param hardpoints - Hardpoint definitions
 * @param config - Timing configuration
 * @returns Visual timeline for the round
 */
export function transformRoundToVisual(
  roundEvents: RoundEvents,
  ship: Ship,
  visualDefinitionOrHardpoints: ShipVisualDefinition | HardpointDefinition[],
  config: VisualTimingConfig = DEFAULT_TIMING
): VisualRoundTimeline {
  const visualEvents: VisualEvent[] = [];
  const hardpoints = getHardpoints(visualDefinitionOrHardpoints);

  // Add round marker at start
  visualEvents.push({
    type: 'round_marker',
    timestamp: 0,
    data: {
      round: roundEvents.round,
    },
  });

  // Transform each combat event
  for (const event of roundEvents.events) {
    if (event.type === 'weapon_fired' && event.weaponId) {
      // Find weapon definition
      const weapon = ship.weapons?.find(w => w.id === event.weaponId);
      const hardpoint = weapon ? findHardpoint(weapon, hardpoints) : undefined;

      // Transform to visual events
      const visuals = transformWeaponFired(event, weapon, hardpoint, config);
      visualEvents.push(...visuals);
    }
  }

  // Sort by timestamp
  visualEvents.sort((a, b) => a.timestamp - b.timestamp);

  // Calculate round duration (last event timestamp + buffer)
  const maxTimestamp = visualEvents.reduce(
    (max, e) => Math.max(max, e.timestamp),
    0
  );
  const duration = maxTimestamp + 500; // Add 500ms buffer

  return {
    round: roundEvents.round,
    events: visualEvents,
    weaponStates: deriveWeaponVisualStates(
      roundEvents,
      ship,
      visualDefinitionOrHardpoints
    ),
    duration,
  };
}

/**
 * Transform multiple rounds into visual timelines
 *
 * @param rounds - Array of combat round events
 * @param ship - Ship definition
 * @param hardpoints - Hardpoint definitions
 * @param config - Timing configuration
 * @returns Array of visual timelines
 */
export function transformCombatToVisual(
  rounds: RoundEvents[],
  ship: Ship,
  visualDefinitionOrHardpoints: ShipVisualDefinition | HardpointDefinition[],
  config: VisualTimingConfig = DEFAULT_TIMING
): VisualRoundTimeline[] {
  return rounds.map((round) =>
    transformRoundToVisual(round, ship, visualDefinitionOrHardpoints, config)
  );
}

/**
 * Transform two-ship combat rounds into per-ship visual timelines.
 *
 * This function does not alter combat sequencing — it simply routes events
 * belonging to each ship to that ship's visual transformer. It returns an
 * object mapping shipId -> VisualRoundTimeline[] so renderers can consume
 * timelines independently for attacker and defender.
 */
export function transformTwoShipCombatToVisual(
  rounds: RoundEvents[],
  attacker: Ship,
  attackerVisual: ShipVisualDefinition | HardpointDefinition[],
  defender: Ship,
  defenderVisual: ShipVisualDefinition | HardpointDefinition[],
  config: VisualTimingConfig = DEFAULT_TIMING
): { [shipId: string]: VisualRoundTimeline[] } {
  const attackerTimelines: VisualRoundTimeline[] = [];
  const defenderTimelines: VisualRoundTimeline[] = [];

  for (const round of rounds) {
    // Filter events for each ship and build a RoundEvents object
    const attackerRound: RoundEvents = {
      round: round.round,
      events: round.events.filter((e) => e.shipId === attacker.id || !e.shipId),
    };

    const defenderRound: RoundEvents = {
      round: round.round,
      events: round.events.filter((e) => e.shipId === defender.id || !e.shipId),
    };

    attackerTimelines.push(
      transformRoundToVisual(attackerRound, attacker, attackerVisual, config)
    );

    defenderTimelines.push(
      transformRoundToVisual(defenderRound, defender, defenderVisual, config)
    );
  }

  return {
    [attacker.id]: attackerTimelines,
    [defender.id]: defenderTimelines,
  };
}
