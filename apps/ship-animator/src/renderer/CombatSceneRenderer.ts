import type {
  HardpointDefinition,
  ShipVisualDefinition,
  VisualEvent,
  WeaponVisualState,
} from '@stfc-vi/visualization-model';
import { createCombatSceneLayout, type CombatSceneLayout, type Point } from './CombatSceneLayout';

type ShipRole = 'attacker' | 'defender';

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

  render(state: CombatSceneRenderState): void {
    this.clear();
    this.renderShip('attacker', this.attackerVisual, state.attacker.weaponStates);
    this.renderShip('defender', this.defenderVisual, state.defender.weaponStates);
    this.renderEvents('attacker', this.attackerVisual, state.attacker.activeEvents, state.roundTime);
    this.renderEvents('defender', this.defenderVisual, state.defender.activeEvents, state.roundTime);
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

  private renderRoundIndicator(round: number): void {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`ROUND ${round}`, 20, 20);
  }
}
