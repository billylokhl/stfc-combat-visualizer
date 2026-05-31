import type { VisualEvent } from '@stfc-vi/visualization-model';

/**
 * Hardpoint visual position
 */
interface HardpointPosition {
  id: string;
  x: number;
  y: number;
  label: string;
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
  private hardpoints: HardpointPosition[];
  private projectiles: Projectile[] = [];

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    
    // Define hardpoint positions (relative to ship center)
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    this.hardpoints = [
      { id: 'left_beam', x: centerX - 60, y: centerY, label: 'L' },
      { id: 'right_beam', x: centerX + 60, y: centerY, label: 'R' },
      { id: 'obliterator', x: centerX, y: centerY - 40, label: 'O' },
    ];
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
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Ship body (rectangle)
    this.ctx.fillStyle = '#333';
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.rect(centerX - 50, centerY - 30, 100, 60);
    this.ctx.fill();
    this.ctx.stroke();

    // Ship label
    this.ctx.fillStyle = '#999';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('AUGUR', centerX, centerY + 5);
  }

  /**
   * Render hardpoint markers
   */
  renderHardpoints(activeHardpoints: Set<string>): void {
    for (const hp of this.hardpoints) {
      const isActive = activeHardpoints.has(hp.id);
      
      // Hardpoint circle
      this.ctx.fillStyle = isActive ? '#ffaa00' : '#555';
      this.ctx.strokeStyle = isActive ? '#ffff00' : '#777';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(hp.x, hp.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Label
      this.ctx.fillStyle = isActive ? '#000' : '#ccc';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(hp.label, hp.x, hp.y);
    }
  }

  /**
   * Render muzzle flash effect
   */
  renderMuzzleFlash(hardpointId: string, intensity: number = 1): void {
    const hp = this.hardpoints.find(h => h.id === hardpointId);
    if (!hp) return;

    // Bright flash circle
    const radius = 20 * intensity;
    const gradient = this.ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, radius);
    gradient.addColorStop(0, `rgba(255, 255, 200, ${intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 200, 0, ${intensity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(hp.x, hp.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Render recoil effect (hardpoint offset)
   */
  renderRecoil(hardpointId: string, intensity: number = 1): void {
    const hp = this.hardpoints.find(h => h.id === hardpointId);
    if (!hp) return;

    // Draw recoil indicator line
    this.ctx.strokeStyle = `rgba(255, 100, 100, ${intensity})`;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(hp.x, hp.y);
    this.ctx.lineTo(hp.x - 15 * intensity, hp.y);
    this.ctx.stroke();
  }

  /**
   * Add a projectile
   */
  launchProjectile(hardpointId: string, time: number): void {
    const hp = this.hardpoints.find(h => h.id === hardpointId);
    if (!hp) return;

    this.projectiles.push({
      x: hp.x,
      y: hp.y,
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
    this.projectiles = this.projectiles.filter(p => {
      const age = currentTime - p.startTime;
      if (age > PROJECTILE_LIFETIME) return false;

      const distance = (age / 1000) * PROJECTILE_SPEED;
      p.x = p.x + distance;

      return true;
    });

    // Render
    for (const p of this.projectiles) {
      const age = currentTime - p.startTime;
      const opacity = Math.max(0, 1 - age / PROJECTILE_LIFETIME);

      this.ctx.fillStyle = `rgba(255, 255, 100, ${opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Trail
      this.ctx.strokeStyle = `rgba(255, 200, 100, ${opacity * 0.5})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x - 10, p.y);
      this.ctx.lineTo(p.x, p.y);
      this.ctx.stroke();
    }
  }

  /**
   * Render visual events
   */
  renderEvents(events: VisualEvent[], currentTime: number): void {
    const activeHardpoints = new Set<string>();

    for (const event of events) {
      if (event.hardpoint) {
        activeHardpoints.add(event.hardpoint);
      }

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
      }
    }

    return;
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
  render(round: number, roundTime: number, activeEvents: VisualEvent[]): void {
    this.clear();
    this.renderShip();
    
    // Determine active hardpoints
    const activeHardpoints = new Set<string>();
    for (const event of activeEvents) {
      if (event.hardpoint) {
        activeHardpoints.add(event.hardpoint);
      }
    }
    
    this.renderHardpoints(activeHardpoints);
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
    
    // Recalculate hardpoint positions
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.hardpoints = [
      { id: 'left_beam', x: centerX - 60, y: centerY, label: 'L' },
      { id: 'right_beam', x: centerX + 60, y: centerY, label: 'R' },
      { id: 'obliterator', x: centerX, y: centerY - 40, label: 'O' },
    ];
  }
}
