/**
 * Visualization Model
 *
 * Transforms combat events into visual timeline events.
 * Framework-agnostic abstraction layer between combat logic and animation.
 * No UI code. No rendering code. No browser dependencies.
 */

import type { Ship, WeaponDefinition } from '@stfc-vi/ship-model';
import type { CombatEvent, RoundEvents, ShipRole } from '@stfc-vi/combat-model';

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
    /** Ship role that emitted the event in two-ship combat */
    sourceRole?: ShipRole;
    /** Source ship id for two-ship combat */
    sourceShipId?: string;
    /** Sequential attack id within the scene round */
    attackId?: string;
    /** 0-indexed attack sequence in scene order */
    attackSequence?: number;
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
 * Timing controls for sequential attack animation at the scene level.
 */
export interface SequentialAttackTimingConfig {
  /** Delay before first attack in a round */
  roundLeadInMs: number;
  /** Gap between consecutive weapon activations */
  attackGapMs: number;
  /** Delay between shots in the same activation */
  shotIntervalMs: number;
  /** Recoil offset from attack start */
  recoilDelayMs: number;
  /** Muzzle flash offset from attack start */
  muzzleFlashDelayMs: number;
  /** Projectile launch offset from attack start */
  projectileLaunchDelayMs: number;
  /** Extra settle time after the final shot event in an activation */
  attackTailMs: number;
  /** Delay after the final activation before round transition */
  roundOutroMs: number;
}

/**
 * Default sequential timing tuned for readability.
 */
export const DEFAULT_SEQUENTIAL_ATTACK_TIMING: SequentialAttackTimingConfig = {
  roundLeadInMs: 150,
  attackGapMs: 240,
  shotIntervalMs: 150,
  recoilDelayMs: 0,
  muzzleFlashDelayMs: 50,
  projectileLaunchDelayMs: 100,
  attackTailMs: 200,
  roundOutroMs: 250,
};

/**
 * Timing details for one shot within a sequential attack.
 */
export interface VisualAttackShot {
  /** Shot index in the activation (0-indexed) */
  shotIndex: number;
  /** Total shots in this activation */
  totalShots: number;
  /** Offset from attack start in ms */
  shotOffsetMs: number;
  /** Absolute event timestamps in round time */
  recoilTimestamp: number;
  muzzleFlashTimestamp: number;
  projectileLaunchTimestamp: number;
}

/**
 * One weapon activation represented in scene sequence order.
 */
export interface VisualAttack {
  /** Stable attack id within this timeline */
  attackId: string;
  /** 0-indexed order in the round */
  attackSequence: number;
  /** Combat round (1-indexed) */
  round: number;
  /** Source role for two-ship combat */
  sourceRole: ShipRole;
  /** Source ship id for two-ship combat */
  sourceShipId?: string;
  /** Weapon id for this activation */
  weaponId: string;
  /** Hardpoint id if resolved from visual definition */
  hardpoint?: string;
  /** Shot-level timing details */
  shots: VisualAttackShot[];
  /** Attack window in round time */
  startTimestamp: number;
  endTimestamp: number;
}

/**
 * Scene-level round timeline where attacker/defender events are sequenced together.
 */
export interface VisualSceneRoundTimeline extends VisualRoundTimeline {
  /** Ordered weapon activations for this round */
  attacks: VisualAttack[];
  /** Role-keyed weapon states used by the ship animator */
  weaponStatesByRole: {
    attacker: WeaponVisualState[];
    defender: WeaponVisualState[];
  };
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

  /**
   * Normalized sprite coordinates for calibrated placement.
   *
   * Values in the range [0, 1] where (0, 0) is the top-left of the sprite image
   * and (1, 1) is the bottom-right. When present and the sprite image is loaded,
   * the renderer uses these in preference to `location`.
   *
   * Calibration workflow:
   *   1. Open the ship sprite in any image editor.
   *   2. Find the pixel position of the weapon origin on the sprite.
   *   3. Divide by image dimensions: nx = px / width, ny = py / height.
   *   4. Update this field and mark the hardpoint as calibrated.
   *
   * Until calibrated, use placeholder values converted from location:
   *   nx = 0.5 + location.x / hull.width
   *   ny = 0.5 + location.y / hull.height
   */
  spriteCoords?: {
    /** Normalized x position, 0 = left edge, 1 = right edge */
    nx: number;
    /** Normalized y position, 0 = top edge, 1 = bottom edge */
    ny: number;
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

  /**
   * Filename of the ship sprite image (e.g. 'augur.png').
   * Resolved by the renderer relative to the ships asset directory.
   * Optional — renderers fall back to placeholder geometry when absent.
   */
  imagePath?: string;

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

function getEventShotCount(event: CombatEvent): number {
  return event.shots && event.shots > 0 ? event.shots : 1;
}

function getAttackWindowDuration(
  shots: number,
  config: SequentialAttackTimingConfig
): number {
  const shotCount = Math.max(1, shots);
  const lastShotOffset = (shotCount - 1) * config.shotIntervalMs;
  const lastEventOffset = Math.max(
    config.recoilDelayMs,
    config.muzzleFlashDelayMs,
    config.projectileLaunchDelayMs
  ) + lastShotOffset;

  return lastEventOffset + config.attackTailMs;
}

function transformSequentialAttack(
  event: CombatEvent,
  hardpoint: HardpointDefinition | undefined,
  attackSequence: number,
  attackStartTimestamp: number,
  config: SequentialAttackTimingConfig
): { attack: VisualAttack; events: VisualEvent[] } {
  const sourceRole: ShipRole = event.role || 'attacker';
  const attackId = `r${event.round}-a${attackSequence + 1}-${sourceRole}-${event.weaponId || 'unknown'}`;
  const totalShots = getEventShotCount(event);
  const shots: VisualAttackShot[] = [];
  const events: VisualEvent[] = [];

  for (let shotIndex = 0; shotIndex < totalShots; shotIndex++) {
    const shotOffsetMs = shotIndex * config.shotIntervalMs;
    const recoilTimestamp = attackStartTimestamp + shotOffsetMs + config.recoilDelayMs;
    const muzzleFlashTimestamp = attackStartTimestamp + shotOffsetMs + config.muzzleFlashDelayMs;
    const projectileLaunchTimestamp = attackStartTimestamp + shotOffsetMs + config.projectileLaunchDelayMs;

    shots.push({
      shotIndex,
      totalShots,
      shotOffsetMs,
      recoilTimestamp,
      muzzleFlashTimestamp,
      projectileLaunchTimestamp,
    });

    const data = {
      shotIndex,
      totalShots,
      round: event.round,
      sourceRole,
      sourceShipId: event.shipId,
      attackId,
      attackSequence,
    };

    events.push({
      type: 'recoil',
      timestamp: recoilTimestamp,
      weaponId: event.weaponId,
      hardpoint: hardpoint?.id,
      data,
    });

    events.push({
      type: 'muzzle_flash',
      timestamp: muzzleFlashTimestamp,
      weaponId: event.weaponId,
      hardpoint: hardpoint?.id,
      data,
    });

    events.push({
      type: 'projectile_launch',
      timestamp: projectileLaunchTimestamp,
      weaponId: event.weaponId,
      hardpoint: hardpoint?.id,
      data,
    });
  }

  const attackDuration = getAttackWindowDuration(totalShots, config);
  const attack: VisualAttack = {
    attackId,
    attackSequence,
    round: event.round,
    sourceRole,
    sourceShipId: event.shipId,
    weaponId: event.weaponId || 'unknown',
    hardpoint: hardpoint?.id,
    shots,
    startTimestamp: attackStartTimestamp,
    endTimestamp: attackStartTimestamp + attackDuration,
  };

  return { attack, events };
}

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

/**
 * Role-keyed two-ship visual timelines.
 *
 * This avoids shipId key collisions for same-ship matchups such as Augur vs Augur.
 */
export interface TwoShipVisualTimelines {
  attacker: VisualRoundTimeline[];
  defender: VisualRoundTimeline[];
}

/**
 * Transform two-ship combat rounds into role-keyed visual timelines.
 *
 * This preserves combat-model ordering and only routes role-tagged events to the
 * correct ship visual transformer.
 */
export function transformTwoShipCombatToRoleVisual(
  rounds: RoundEvents[],
  attacker: Ship,
  attackerVisual: ShipVisualDefinition | HardpointDefinition[],
  defender: Ship,
  defenderVisual: ShipVisualDefinition | HardpointDefinition[],
  config: VisualTimingConfig = DEFAULT_TIMING
): TwoShipVisualTimelines {
  const attackerTimelines: VisualRoundTimeline[] = [];
  const defenderTimelines: VisualRoundTimeline[] = [];

  for (const round of rounds) {
    const attackerRound: RoundEvents = {
      round: round.round,
      events: round.events.filter((event) => event.role === 'attacker' || !event.role),
    };

    const defenderRound: RoundEvents = {
      round: round.round,
      events: round.events.filter((event) => event.role === 'defender' || !event.role),
    };

    attackerTimelines.push(
      transformRoundToVisual(attackerRound, attacker, attackerVisual, config)
    );

    defenderTimelines.push(
      transformRoundToVisual(defenderRound, defender, defenderVisual, config)
    );
  }

  return {
    attacker: attackerTimelines,
    defender: defenderTimelines,
  };
}

/**
 * Transform single-ship combat rounds into scene-level sequential timelines.
 *
 * This API preserves attack sequencing from combat event order and emits
 * scene-level attack metadata while still producing VisualEvent entries.
 */
export function transformCombatToSequentialVisual(
  rounds: RoundEvents[],
  ship: Ship,
  visualDefinitionOrHardpoints: ShipVisualDefinition | HardpointDefinition[],
  config: SequentialAttackTimingConfig = DEFAULT_SEQUENTIAL_ATTACK_TIMING
): VisualSceneRoundTimeline[] {
  const hardpoints = getHardpoints(visualDefinitionOrHardpoints);

  return rounds.map((round) => {
    const attacks: VisualAttack[] = [];
    const events: VisualEvent[] = [{
      type: 'round_marker',
      timestamp: 0,
      data: { round: round.round },
    }];

    let attackStartTimestamp = config.roundLeadInMs;

    for (const event of round.events) {
      if (event.type !== 'weapon_fired' || !event.weaponId) {
        continue;
      }

      const weapon = ship.weapons?.find((candidate) => candidate.id === event.weaponId);
      const hardpoint = weapon ? findHardpoint(weapon, hardpoints) : undefined;
      const { attack, events: attackEvents } = transformSequentialAttack(
        event,
        hardpoint,
        attacks.length,
        attackStartTimestamp,
        config
      );

      attacks.push(attack);
      events.push(...attackEvents);
      attackStartTimestamp = attack.endTimestamp + config.attackGapMs;
    }

    events.sort((a, b) => a.timestamp - b.timestamp);
    const lastAttackEnd = attacks.length > 0 ? attacks[attacks.length - 1].endTimestamp : config.roundLeadInMs;
    const duration = lastAttackEnd + config.roundOutroMs;

    return {
      round: round.round,
      attacks,
      events,
      weaponStates: deriveWeaponVisualStates(round, ship, visualDefinitionOrHardpoints),
      weaponStatesByRole: {
        attacker: deriveWeaponVisualStates(round, ship, visualDefinitionOrHardpoints),
        defender: [],
      },
      duration,
    };
  });
}

/**
 * Transform two-ship combat rounds into scene-level sequential timelines.
 *
 * Ordering source of truth:
 * - Input round.events array order from combat-model
 * - Only weapon_fired events participate in sequencing
 * - round_start/round_end are ignored for attack ordering
 */
export function transformTwoShipCombatToSequentialVisual(
  rounds: RoundEvents[],
  attacker: Ship,
  attackerVisual: ShipVisualDefinition | HardpointDefinition[],
  defender: Ship,
  defenderVisual: ShipVisualDefinition | HardpointDefinition[],
  config: SequentialAttackTimingConfig = DEFAULT_SEQUENTIAL_ATTACK_TIMING
): VisualSceneRoundTimeline[] {
  const attackerHardpoints = getHardpoints(attackerVisual);
  const defenderHardpoints = getHardpoints(defenderVisual);

  return rounds.map((round) => {
    const attacks: VisualAttack[] = [];
    const events: VisualEvent[] = [{
      type: 'round_marker',
      timestamp: 0,
      data: { round: round.round },
    }];

    let attackStartTimestamp = config.roundLeadInMs;

    for (const event of round.events) {
      if (event.type !== 'weapon_fired' || !event.weaponId) {
        continue;
      }

      const sourceRole: ShipRole = event.role || 'attacker';
      const sourceShip = sourceRole === 'defender' ? defender : attacker;
      const sourceHardpoints = sourceRole === 'defender' ? defenderHardpoints : attackerHardpoints;
      const weapon = sourceShip.weapons?.find((candidate) => candidate.id === event.weaponId);
      const hardpoint = weapon ? findHardpoint(weapon, sourceHardpoints) : undefined;
      const { attack, events: attackEvents } = transformSequentialAttack(
        event,
        hardpoint,
        attacks.length,
        attackStartTimestamp,
        config
      );

      attacks.push(attack);
      events.push(...attackEvents);
      attackStartTimestamp = attack.endTimestamp + config.attackGapMs;
    }

    events.sort((a, b) => a.timestamp - b.timestamp);
    const lastAttackEnd = attacks.length > 0 ? attacks[attacks.length - 1].endTimestamp : config.roundLeadInMs;
    const duration = lastAttackEnd + config.roundOutroMs;

    const attackerRound: RoundEvents = {
      round: round.round,
      events: round.events.filter((event) => event.role === 'attacker'),
    };

    const defenderRound: RoundEvents = {
      round: round.round,
      events: round.events.filter((event) => event.role === 'defender'),
    };

    return {
      round: round.round,
      attacks,
      events,
      weaponStates: [],
      weaponStatesByRole: {
        attacker: deriveWeaponVisualStates(attackerRound, attacker, attackerVisual),
        defender: deriveWeaponVisualStates(defenderRound, defender, defenderVisual),
      },
      duration,
    };
  });
}
