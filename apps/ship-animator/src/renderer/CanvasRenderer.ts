import type {
  HardpointDefinition,
  ShipVisualDefinition,
  VisualEvent,
  WeaponVisualState,
} from '@stfc-vi/visualization-model';

/**
 * Hardpoint visual position
 */
interface RenderedHardpoint {
  definition: HardpointDefinition;
  x: number;
  y: number;
}

/**
 * Projectile state
 */
interface Projectile {
  x: number;
  y: number;
  startTime: number;
  hardpoint: string;
}

/**
 * Canvas Renderer
 *
 * Minimal renderer using simple primitives.
 * No images, no fancy effects - just shapes and labels.
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private projectiles: Projectile[] = [];
  private visualDefinition: ShipVisualDefinition;

  constructor(canvas: HTMLCanvasElement, visualDefinition: ShipVisualDefinition) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.visualDefinition = visualDefinition;
  }

  private getCenter(): { x: number; y: number } {
    return {
      x: this.width / 2,
      y: this.height / 2,
    };
  }

  private getScale(): number {
    const hull = this.visualDefinition.hull;
    const maxVisualWidth = Math.max(
      hull.width,
      ...this.visualDefinition.hardpoints.map((hardpoint) =>
        Math.abs(hardpoint.location.x) * 2 + 32
      )
    );
    const maxVisualHeight = Math.max(
      hull.height,
      ...this.visualDefinition.hardpoints.map((hardpoint) =>
        Math.abs(hardpoint.location.y) * 2 + 32
      )
    );

    const availableWidth = this.width * 0.65;
    const availableHeight = this.height * 0.65;

    return Math.min(
      availableWidth / maxVisualWidth,
      availableHeight / maxVisualHeight,
      2
    );
  }

  private getRenderedHardpoints(): RenderedHardpoint[] {
    const center = this.getCenter();
    const scale = this.getScale();

    return this.visualDefinition.hardpoints.map((hardpoint) => ({
      definition: hardpoint,
      x: center.x + hardpoint.location.x * scale,
      y: center.y + hardpoint.location.y * scale,
    }));
  }

  private findHardpoint(hardpointId: string): RenderedHardpoint | undefined {
    return this.getRenderedHardpoints().find(
      (hardpoint) => hardpoint.definition.id === hardpointId
    );
  }

  /**
   * Clear canvas
   */
  clear(): void {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Render the ship (simple geometric representation)
   */
  renderShip(): void {
    const center = this.getCenter();
    const scale = this.getScale();
    const hull = this.visualDefinition.hull;
    const hullWidth = hull.width * scale;
    const hullHeight = hull.height * scale;

    this.ctx.fillStyle = '#333';
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.rect(
      center.x - hullWidth / 2,
      center.y - hullHeight / 2,
      hullWidth,
      hullHeight
    );
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#999';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(hull.label || this.visualDefinition.displayName, center.x, center.y);
  }

  /**
   * Render hardpoint markers
   */
  renderHardpoints(weaponStates: WeaponVisualState[]): void {
    const stateByHardpoint = new Map(
      weaponStates.map((state) => [state.hardpointId, state])
    );

    for (const hardpoint of this.getRenderedHardpoints()) {
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

  /**
   * Render muzzle flash effect
   */
  renderMuzzleFlash(hardpointId: string, intensity: number = 1): void {
    const hardpoint = this.findHardpoint(hardpointId);
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

  /**
   * Render recoil effect (hardpoint offset)
   */
  renderRecoil(hardpointId: string, intensity: number = 1): void {
    const hardpoint = this.findHardpoint(hardpointId);
    if (!hardpoint) return;

    this.ctx.strokeStyle = `rgba(255, 100, 100, ${intensity})`;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(hardpoint.x, hardpoint.y);
    this.ctx.lineTo(hardpoint.x - 15 * intensity, hardpoint.y);
    this.ctx.stroke();
  }

  /**
   * Add a projectile
   */
  launchProjectile(hardpointId: string, time: number): void {
    const hardpoint = this.findHardpoint(hardpointId);
    if (!hardpoint) return;

    this.projectiles.push({
      x: hardpoint.x,
      y: hardpoint.y,
      startTime: time,
      hardpoint: hardpointId,
    });
  }

  /**
   * Update and render projectiles
   */
  renderProjectiles(currentTime: number): void {
    const PROJECTILE_SPEED = 200; // pixels per second
    const PROJECTILE_LIFETIME = 2000; // ms

    // Update positions
    this.projectiles = this.projectiles.filter((projectile) => {
      const age = currentTime - projectile.startTime;
      if (age > PROJECTILE_LIFETIME) return false;

      const distance = (age / 1000) * PROJECTILE_SPEED;
      projectile.x = projectile.x + distance;

      return true;
    });

    // Render
    for (const projectile of this.projectiles) {
      const age = currentTime - projectile.startTime;
      const opacity = Math.max(0, 1 - age / PROJECTILE_LIFETIME);

      this.ctx.fillStyle = `rgba(255, 255, 100, ${opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Trail
      this.ctx.strokeStyle = `rgba(255, 200, 100, ${opacity * 0.5})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(projectile.x - 10, projectile.y);
      this.ctx.lineTo(projectile.x, projectile.y);
      this.ctx.stroke();
    }
  }

  /**
   * Render visual events
   */
  renderEvents(events: VisualEvent[], currentTime: number): void {
    for (const event of events) {
      const age = currentTime - event.timestamp;
      const intensity = Math.max(0, 1 - age / 100);

      switch (event.type) {
        case 'muzzle_flash':
          if (event.hardpoint) {
            this.renderMuzzleFlash(event.hardpoint, intensity);
          }
          break;

        case 'recoil':
          if (event.hardpoint) {
            this.renderRecoil(event.hardpoint, intensity);
          }
          break;

        case 'projectile_launch':
          // Projectiles are added once and then rendered separately
          break;

        default:
          break;
      }
    }
  }

  /**
   * Render round indicator
   */
  renderRoundIndicator(round: number): void {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`ROUND ${round}`, 20, 20);
  }

  /**
   * Main render method
   */
  render(
    round: number,
    roundTime: number,
    activeEvents: VisualEvent[],
    weaponStates: WeaponVisualState[]
  ): void {
    this.clear();
    this.renderShip();

    this.renderHardpoints(weaponStates);
    this.renderEvents(activeEvents, roundTime);
    this.renderProjectiles(roundTime);
    this.renderRoundIndicator(round);

    // Launch projectiles from active events
    for (const event of activeEvents) {
      if (event.type === 'projectile_launch' && event.hardpoint) {
        // Only launch if this is a new event (age < 16ms, roughly one frame)
        const age = roundTime - event.timestamp;
        if (age >= 0 && age < 16) {
          this.launchProjectile(event.hardpoint, roundTime);
        }
      }
    }
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
