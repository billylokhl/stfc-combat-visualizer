import type {
  HardpointDefinition,
  ShipVisualDefinition,
  VisualEvent,
  WeaponVisualState,
} from '@stfc-vi/visualization-model';
import { createCombatSceneLayout, type CombatSceneLayout, type Point } from './CombatSceneLayout';

type ShipRole = 'attacker' | 'defender';

// Visual-only projectile constants. Not related to combat timing.
const PROJECTILE_DURATION_FACTOR = 1.2; // ms per canvas pixel
const PROJECTILE_MIN_DURATION = 300;    // ms
const PROJECTILE_MAX_DURATION = 900;    // ms

interface SceneProjectile {
  id: string;
  sourceRole: ShipRole;
  weaponId?: string;
  hardpointId: string;
  origin: Point;
  target: Point;
  startTime: number;
  duration: number;
}

interface RenderedHardpoint {
  definition: HardpointDefinition;
  x: number;
  y: number;
}

export interface RoleRenderState {
  activeEvents: VisualEvent[];
  weaponStates: WeaponVisualState[];
}

export interface CombatSceneRenderState {
  round: number;
  roundTime: number;
  attacker: RoleRenderState;
  defender: RoleRenderState;
}

export class CombatSceneRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private attackerVisual: ShipVisualDefinition;
  private defenderVisual: ShipVisualDefinition;
  private layout: CombatSceneLayout;

  // Projectile state — renderer-owned, visual only
  private activeProjectiles: SceneProjectile[] = [];
  private launchedProjectileIds: Set<string> = new Set();
  private lastRenderedRound: number = -1;

  constructor(
    canvas: HTMLCanvasElement,
    attackerVisual: ShipVisualDefinition,
    defenderVisual: ShipVisualDefinition
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.attackerVisual = attackerVisual;
    this.defenderVisual = defenderVisual;
    this.layout = createCombatSceneLayout(
      this.width,
      this.height,
      attackerVisual,
      defenderVisual
    );
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.layout = createCombatSceneLayout(
      width,
      height,
      this.attackerVisual,
      this.defenderVisual
    );
  }

  /** Clear all projectile state. Called on round change, restart, and recreation. */
  clearProjectileState(): void {
    this.activeProjectiles = [];
    this.launchedProjectileIds.clear();
    this.lastRenderedRound = -1;
  }

  render(state: CombatSceneRenderState): void {
    // Clear projectile state when the round changes
    if (state.round !== this.lastRenderedRound) {
      this.clearProjectileState();
      this.lastRenderedRound = state.round;
    }

    // Spawn new projectiles from active projectile_launch events (deduped by ID)
    this.spawnProjectiles('attacker', state.attacker.activeEvents, state.roundTime);
    this.spawnProjectiles('defender', state.defender.activeEvents, state.roundTime);

    // Expire projectiles that have completed travel
    this.expireProjectiles(state.roundTime);

    // Draw in required order:
    // 1. clear  2. ships+hardpoints  3. muzzle flash/recoil  4. projectiles  5. round indicator
    this.clear();
    this.renderShip('attacker', this.attackerVisual, state.attacker.weaponStates);
    this.renderShip('defender', this.defenderVisual, state.defender.weaponStates);
    this.renderEvents('attacker', this.attackerVisual, state.attacker.activeEvents, state.roundTime);
    this.renderEvents('defender', this.defenderVisual, state.defender.activeEvents, state.roundTime);
    this.renderProjectiles(state.roundTime);
    this.renderRoundIndicator(state.round);
  }

  private clear(): void {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private getRoleAnchor(role: ShipRole): Point {
    return role === 'attacker'
      ? this.layout.attackerAnchor
      : this.layout.defenderAnchor;
  }

  private getRoleScale(role: ShipRole): number {
    return role === 'attacker'
      ? this.layout.attackerScale
      : this.layout.defenderScale;
  }

  private getRenderedHardpoints(
    role: ShipRole,
    visualDefinition: ShipVisualDefinition
  ): RenderedHardpoint[] {
    const anchor = this.getRoleAnchor(role);
    const scale = this.getRoleScale(role);

    return visualDefinition.hardpoints.map((hardpoint) => ({
      definition: hardpoint,
      x: anchor.x + hardpoint.location.x * scale,
      y: anchor.y + hardpoint.location.y * scale,
    }));
  }

  private findHardpoint(
    role: ShipRole,
    visualDefinition: ShipVisualDefinition,
    hardpointId: string
  ): RenderedHardpoint | undefined {
    return this.getRenderedHardpoints(role, visualDefinition).find(
      (hardpoint) => hardpoint.definition.id === hardpointId
    );
  }

  private renderShip(
    role: ShipRole,
    visualDefinition: ShipVisualDefinition,
    weaponStates: WeaponVisualState[]
  ): void {
    const anchor = this.getRoleAnchor(role);
    const scale = this.getRoleScale(role);
    const hull = visualDefinition.hull;
    const hullWidth = hull.width * scale;
    const hullHeight = hull.height * scale;

    this.ctx.fillStyle = '#333';
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.rect(
      anchor.x - hullWidth / 2,
      anchor.y - hullHeight / 2,
      hullWidth,
      hullHeight
    );
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#999';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(hull.label || visualDefinition.displayName, anchor.x, anchor.y);

    this.ctx.fillStyle = role === 'attacker' ? '#4caf50' : '#2196f3';
    this.ctx.font = '11px monospace';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(role.toUpperCase(), anchor.x, anchor.y - hullHeight / 2 - 14);

    this.renderHardpoints(role, visualDefinition, weaponStates);
  }

  private renderHardpoints(
    role: ShipRole,
    visualDefinition: ShipVisualDefinition,
    weaponStates: WeaponVisualState[]
  ): void {
    const stateByHardpoint = new Map(
      weaponStates.map((state) => [state.hardpointId, state])
    );

    for (const hardpoint of this.getRenderedHardpoints(role, visualDefinition)) {
      const state = stateByHardpoint.get(hardpoint.definition.id);
      const isFiring = state?.state === 'firing';

      this.ctx.fillStyle = isFiring ? '#ffaa00' : '#182f34';
      this.ctx.strokeStyle = isFiring ? '#ffff00' : '#55c7d6';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(hardpoint.x, hardpoint.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      if (!isFiring) {
        this.ctx.strokeStyle = 'rgba(85, 199, 214, 0.45)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(hardpoint.x, hardpoint.y, 17, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = isFiring ? '#000' : '#d8f9ff';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(hardpoint.definition.label, hardpoint.x, hardpoint.y);
    }
  }

  private renderEvents(
    role: ShipRole,
    visualDefinition: ShipVisualDefinition,
    events: VisualEvent[],
    roundTime: number
  ): void {
    for (const event of events) {
      const age = roundTime - event.timestamp;
      const intensity = Math.max(0, 1 - age / 100);

      if (!event.hardpoint) {
        continue;
      }

      if (event.type === 'muzzle_flash') {
        this.renderMuzzleFlash(role, visualDefinition, event.hardpoint, intensity);
      }

      if (event.type === 'recoil') {
        this.renderRecoil(role, visualDefinition, event.hardpoint, intensity);
      }
    }
  }

  private renderMuzzleFlash(
    role: ShipRole,
    visualDefinition: ShipVisualDefinition,
    hardpointId: string,
    intensity: number
  ): void {
    const hardpoint = this.findHardpoint(role, visualDefinition, hardpointId);
    if (!hardpoint) return;

    const radius = 20 * intensity;
    const gradient = this.ctx.createRadialGradient(
      hardpoint.x,
      hardpoint.y,
      0,
      hardpoint.x,
      hardpoint.y,
      radius
    );
    gradient.addColorStop(0, `rgba(255, 255, 200, ${intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 200, 0, ${intensity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(hardpoint.x, hardpoint.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderRecoil(
    role: ShipRole,
    visualDefinition: ShipVisualDefinition,
    hardpointId: string,
    intensity: number
  ): void {
    const hardpoint = this.findHardpoint(role, visualDefinition, hardpointId);
    if (!hardpoint) return;

    const direction = role === 'attacker' ? -1 : 1;

    this.ctx.strokeStyle = `rgba(255, 100, 100, ${intensity})`;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(hardpoint.x, hardpoint.y);
    this.ctx.lineTo(hardpoint.x + direction * 15 * intensity, hardpoint.y);
    this.ctx.stroke();
  }

  /**
   * Consume projectile_launch events from the active event window.
   * Creates one SceneProjectile per unique event; skips if hardpoint cannot be resolved.
   */
  private spawnProjectiles(
    role: ShipRole,
    events: VisualEvent[],
    _roundTime: number
  ): void {
    const visualDef = role === 'attacker' ? this.attackerVisual : this.defenderVisual;
    const targetAnchor = role === 'attacker'
      ? this.layout.defenderAnchor
      : this.layout.attackerAnchor;

    for (const event of events) {
      if (event.type !== 'projectile_launch' || !event.hardpoint) {
        continue;
      }

      // Deterministic ID prevents duplicate creation across animation frames
      const shotIndex = event.data?.shotIndex ?? 0;
      const id = `${role}-r${this.lastRenderedRound}-t${event.timestamp}-w${event.weaponId ?? ''}-hp${event.hardpoint}-s${shotIndex}`;

      if (this.launchedProjectileIds.has(id)) {
        continue;
      }

      // Origin from firing role's rendered hardpoint — no fallback if missing
      const hardpoint = this.findHardpoint(role, visualDef, event.hardpoint);
      if (!hardpoint) {
        continue;
      }

      const origin: Point = { x: hardpoint.x, y: hardpoint.y };
      const target: Point = { x: targetAnchor.x, y: targetAnchor.y };

      const dx = target.x - origin.x;
      const dy = target.y - origin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const duration = Math.min(
        PROJECTILE_MAX_DURATION,
        Math.max(PROJECTILE_MIN_DURATION, distance * PROJECTILE_DURATION_FACTOR)
      );

      this.launchedProjectileIds.add(id);
      this.activeProjectiles.push({
        id,
        sourceRole: role,
        weaponId: event.weaponId,
        hardpointId: event.hardpoint,
        origin,
        target,
        startTime: event.timestamp,
        duration,
      });
    }
  }

  /** Remove projectiles that have reached their target. */
  private expireProjectiles(roundTime: number): void {
    this.activeProjectiles = this.activeProjectiles.filter(
      (p) => roundTime - p.startTime < p.duration
    );
  }

  /** Draw all in-flight projectiles as a dot with a short trail. */
  private renderProjectiles(roundTime: number): void {
    for (const projectile of this.activeProjectiles) {
      const elapsed = roundTime - projectile.startTime;
      const progress = Math.min(1, Math.max(0, elapsed / projectile.duration));
      const opacity = Math.max(0, 1 - progress * 0.3);

      const x = projectile.origin.x + (projectile.target.x - projectile.origin.x) * progress;
      const y = projectile.origin.y + (projectile.target.y - projectile.origin.y) * progress;

      // Short trail: 5% of total path behind current position
      const TRAIL_FRAC = 0.05;
      const trailProgress = Math.max(0, progress - TRAIL_FRAC);
      const trailX = projectile.origin.x + (projectile.target.x - projectile.origin.x) * trailProgress;
      const trailY = projectile.origin.y + (projectile.target.y - projectile.origin.y) * trailProgress;

      this.ctx.strokeStyle = `rgba(255, 220, 100, ${opacity * 0.5})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(trailX, trailY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      this.ctx.fillStyle = `rgba(255, 255, 150, ${opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private renderRoundIndicator(round: number): void {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`ROUND ${round}`, 20, 20);
  }
}
