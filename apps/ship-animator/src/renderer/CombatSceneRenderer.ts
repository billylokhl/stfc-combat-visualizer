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

interface ImpactEffect {
  x: number;
  y: number;
  startTimeMs: number;
  durationMs: number;
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

  // Ship sprite image cache — keyed by imagePath filename
  private shipImages: Map<string, HTMLImageElement> = new Map();

  // Projectile state — renderer-owned, visual only
  private activeProjectiles: SceneProjectile[] = [];
  private launchedProjectileIds: Set<string> = new Set();
  private lastRenderedRound: number = -1;

  // Impact effect state — renderer-owned, visual only
  private activeImpactEffects: ImpactEffect[] = [];

  // Debug overlay state
  private debugOverlayEnabled: boolean = false;

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

  /** Enable or disable the hardpoint debug overlay. */
  setDebugOverlayEnabled(enabled: boolean): void {
    this.debugOverlayEnabled = enabled;
  }

  /** Clear all projectile and impact effect state. Called on round change, restart, and recreation. */
  clearProjectileState(): void {
    this.activeProjectiles = [];
    this.launchedProjectileIds.clear();
    this.lastRenderedRound = -1;
    this.activeImpactEffects = [];
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
    this.renderImpactEffects(state.roundTime);
    this.renderRoundIndicator(state.round);
    if (this.debugOverlayEnabled) {
      this.renderDebugOverlay();
    }
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
    const hull = visualDefinition.hull;
    const hullWidth = hull.width * scale;
    const hullHeight = hull.height * scale;

    // Compute sprite draw dimensions to map spriteCoords to screen pixels.
    // Mirrors the contain-fit logic in renderShip.
    let imgDrawWidth = hullWidth;
    let imgDrawHeight = hullHeight;
    if (visualDefinition.imagePath) {
      const img = this.shipImages.get(visualDefinition.imagePath);
      if (img?.complete && img.naturalWidth > 0) {
        const aspect = img.naturalWidth / img.naturalHeight;
        if (aspect >= 1) {
          imgDrawWidth = hullWidth;
          imgDrawHeight = hullWidth / aspect;
        } else {
          imgDrawHeight = hullHeight;
          imgDrawWidth = hullHeight * aspect;
        }
      }
    }

    return visualDefinition.hardpoints.map((hardpoint) => {
      if (hardpoint.spriteCoords) {
        const { nx, ny } = hardpoint.spriteCoords;
        // Defender sprite is mirrored horizontally so ships face each other.
        // Flip nx so spriteCoords always reference the un-mirrored sprite.
        const effectiveNx = role === 'defender' ? 1 - nx : nx;
        return {
          definition: hardpoint,
          x: anchor.x - imgDrawWidth / 2 + effectiveNx * imgDrawWidth,
          y: anchor.y - imgDrawHeight / 2 + ny * imgDrawHeight,
        };
      }
      return {
        definition: hardpoint,
        x: anchor.x + hardpoint.location.x * scale,
        y: anchor.y + hardpoint.location.y * scale,
      };
    });
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

  /**
   * Load or return cached HTMLImageElement for a given imagePath filename.
   * Images are served from the ships asset directory via Vite's publicDir.
   */
  private getOrLoadImage(imagePath: string): HTMLImageElement {
    let img = this.shipImages.get(imagePath);
    if (!img) {
      img = new Image();
      img.src = `${import.meta.env.BASE_URL}ships/${imagePath}`;
      this.shipImages.set(imagePath, img);
    }
    return img;
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

    const labelColor = role === 'attacker' ? '#4caf50' : '#2196f3';

    if (visualDefinition.imagePath) {
      const img = this.getOrLoadImage(visualDefinition.imagePath);

      if (img.complete && img.naturalWidth > 0) {
        // Contain-fit: maintain natural aspect ratio within hull bounds
        const aspect = img.naturalWidth / img.naturalHeight;
        let drawWidth: number;
        let drawHeight: number;
        if (aspect >= 1) {
          drawWidth = hullWidth;
          drawHeight = hullWidth / aspect;
        } else {
          drawHeight = hullHeight;
          drawWidth = hullHeight * aspect;
        }

        // Defender is mirrored horizontally so ships face each other
        const mirror = role === 'defender';

        this.ctx.save();
        this.ctx.translate(anchor.x, anchor.y);
        if (mirror) {
          this.ctx.scale(-1, 1);
        }
        this.ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        this.ctx.restore();
      } else {
        // Image not yet loaded — render placeholder rectangle while loading
        this.renderShipPlaceholder(anchor.x, anchor.y, hullWidth, hullHeight, hull.label ?? visualDefinition.displayName);
      }
    } else {
      this.renderShipPlaceholder(anchor.x, anchor.y, hullWidth, hullHeight, hull.label ?? visualDefinition.displayName);
    }

    // Role label above the ship
    this.ctx.fillStyle = labelColor;
    this.ctx.font = '11px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(role.toUpperCase(), anchor.x, anchor.y - hullHeight / 2 - 14);

    this.renderHardpoints(role, visualDefinition, weaponStates);
  }

  private renderShipPlaceholder(
    cx: number,
    cy: number,
    w: number,
    h: number,
    label: string
  ): void {
    this.ctx.fillStyle = '#333';
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.rect(cx - w / 2, cy - h / 2, w, h);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#999';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, cx, cy);
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

  /** Remove projectiles that have reached their target and spawn impact effects. */
  private expireProjectiles(roundTime: number): void {
    const remaining: SceneProjectile[] = [];
    for (const p of this.activeProjectiles) {
      if (roundTime - p.startTime < p.duration) {
        remaining.push(p);
      } else {
        this.activeImpactEffects.push({
          x: p.target.x,
          y: p.target.y,
          startTimeMs: p.startTime + p.duration,
          durationMs: 450,
        });
      }
    }
    this.activeProjectiles = remaining;
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

  /** Render expanding ring impact effects for completed projectiles. */
  private renderImpactEffects(roundTime: number): void {
    this.activeImpactEffects = this.activeImpactEffects.filter(
      (e) => roundTime - e.startTimeMs < e.durationMs
    );

    for (const effect of this.activeImpactEffects) {
      const elapsed = roundTime - effect.startTimeMs;
      const t = Math.min(1, Math.max(0, elapsed / effect.durationMs));
      const alpha = 1 - t;

      // Primary expanding ring
      const maxRadius = 40;
      const radius = maxRadius * t;
      this.ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.9})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();

      // Secondary ring slightly behind the primary
      if (t > 0.1) {
        const innerRadius = maxRadius * (t - 0.1);
        this.ctx.strokeStyle = `rgba(200, 240, 255, ${alpha * 0.5})`;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, innerRadius, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      // Subtle central glow that fades and shrinks
      const glowRadius = 15 * (1 - t);
      if (glowRadius > 0.5) {
        const gradient = this.ctx.createRadialGradient(
          effect.x, effect.y, 0,
          effect.x, effect.y, glowRadius
        );
        gradient.addColorStop(0, `rgba(150, 220, 255, ${alpha * 0.6})`);
        gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  private renderRoundIndicator(round: number): void {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`ROUND ${round}`, 20, 20);
  }

  // ─── Debug Overlay ────────────────────────────────────────────────────────

  private renderDebugOverlay(): void {
    this.renderRoleDebugOverlay('attacker', this.attackerVisual);
    this.renderRoleDebugOverlay('defender', this.defenderVisual);
  }

  private renderRoleDebugOverlay(role: ShipRole, visualDefinition: ShipVisualDefinition): void {
    const hardpoints = this.getRenderedHardpoints(role, visualDefinition);

    for (const hp of hardpoints) {
      const def = hp.definition;
      const { x, y } = hp;

      // Compute display coords — prefer calibrated spriteCoords, fall back to derived
      let coordStr: string;
      if (def.spriteCoords) {
        coordStr = `(${def.spriteCoords.nx.toFixed(2)}, ${def.spriteCoords.ny.toFixed(2)})`;
      } else {
        const nx = 0.5 + def.location.x / visualDefinition.hull.width;
        const ny = 0.5 + def.location.y / visualDefinition.hull.height;
        coordStr = `(${nx.toFixed(2)}, ${ny.toFixed(2)})`;
      }

      // Draw a bright outer ring distinct from the normal hardpoint marker
      this.ctx.strokeStyle = '#ffff00';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 20, 0, Math.PI * 2);
      this.ctx.stroke();

      // Text lines: short code / weapon name / coords
      const lines = [def.label, def.name, coordStr];
      const lineHeight = 13;
      const padding = 4;

      this.ctx.font = '11px monospace';
      const maxWidth = Math.max(...lines.map((l) => this.ctx.measureText(l).width));
      const bgWidth = maxWidth + padding * 2;
      const bgHeight = lines.length * lineHeight + padding * 2;

      // Position text box below the ring
      const boxX = x - bgWidth / 2;
      const boxY = y + 24;

      // Dark semi-transparent background for readability on any ship sprite
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
      this.ctx.fillRect(boxX, boxY, bgWidth, bgHeight);

      this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(boxX, boxY, bgWidth, bgHeight);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '11px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      for (let i = 0; i < lines.length; i++) {
        this.ctx.fillText(lines[i], x, boxY + padding + i * lineHeight);
      }
    }
  }

  /**
   * Log canvas click position as normalized sprite coordinates and nearest hardpoint.
   * Called by the React component when the canvas is clicked while the overlay is enabled.
   */
  handleDebugClick(canvasX: number, canvasY: number): void {
    if (!this.debugOverlayEnabled) return;

    const roles: ShipRole[] = ['attacker', 'defender'];
    for (const role of roles) {
      const visualDef = role === 'attacker' ? this.attackerVisual : this.defenderVisual;
      const anchor = this.getRoleAnchor(role);
      const scale = this.getRoleScale(role);
      const hull = visualDef.hull;
      const hullWidth = hull.width * scale;
      const hullHeight = hull.height * scale;

      // Replicate contain-fit sprite draw dimensions from getRenderedHardpoints
      let imgDrawWidth = hullWidth;
      let imgDrawHeight = hullHeight;
      if (visualDef.imagePath) {
        const img = this.shipImages.get(visualDef.imagePath);
        if (img?.complete && img.naturalWidth > 0) {
          const aspect = img.naturalWidth / img.naturalHeight;
          if (aspect >= 1) {
            imgDrawWidth = hullWidth;
            imgDrawHeight = hullWidth / aspect;
          } else {
            imgDrawHeight = hullHeight;
            imgDrawWidth = hullHeight * aspect;
          }
        }
      }

      const spriteLeft = anchor.x - imgDrawWidth / 2;
      const spriteTop = anchor.y - imgDrawHeight / 2;

      // Normalize click relative to sprite bounds
      let nx = (canvasX - spriteLeft) / imgDrawWidth;
      let ny = (canvasY - spriteTop) / imgDrawHeight;

      // Defender sprite is rendered mirrored — un-flip so coords match un-mirrored sprite
      if (role === 'defender') {
        nx = 1 - nx;
      }

      // Find nearest hardpoint by canvas distance
      const hardpoints = this.getRenderedHardpoints(role, visualDef);
      let nearest: RenderedHardpoint | null = null;
      let nearestDist = Infinity;
      for (const hp of hardpoints) {
        const dx = canvasX - hp.x;
        const dy = canvasY - hp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = hp;
        }
      }

      console.log(
        `[HARDPOINT DEBUG] ${role.toUpperCase()}\n` +
        `  canvas: (${Math.round(canvasX)}, ${Math.round(canvasY)})\n` +
        `  sprite: nx=${nx.toFixed(3)}, ny=${ny.toFixed(3)}\n` +
        `  nearest: ${nearest?.definition.id ?? 'none'} "${nearest?.definition.name ?? ''}" (${nearestDist.toFixed(1)}px)`
      );
    }
  }
}
