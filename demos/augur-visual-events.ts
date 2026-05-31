#!/usr/bin/env node
/**
 * Augur Visual Events Demo
 *
 * Demonstrates the visualization model by transforming combat events
 * into visual timeline events for the Augur ship.
 *
 * Usage:
 *   npm run demo:visual
 *   or
 *   ts-node --project tsconfig.demo.json demos/augur-visual-events.ts
 */

import { generateCombatEvents } from '@stfc-vi/combat-model';
import { augur } from '@stfc-vi/combat-model/examples';
import {
  transformCombatToVisual,
  DEFAULT_TIMING,
  type VisualEvent,
} from '@stfc-vi/visualization-model';
import { augurHardpoints } from '@stfc-vi/visualization-model/examples';

/**
 * Format timestamp as milliseconds with padding
 */
function formatTimestamp(ms: number): string {
  return `${ms.toString().padStart(4, ' ')}ms`;
}

/**
 * Format event type with color-like indicator
 */
function formatEventType(type: string): string {
  const typeMap: Record<string, string> = {
    round_marker: '🏁',
    recoil: '↩️ ',
    muzzle_flash: '💥',
    projectile_launch: '🚀',
    impact: '💢',
  };
  return `${typeMap[type] || '  '} ${type.padEnd(18, ' ')}`;
}

/**
 * Format hardpoint identifier
 */
function formatHardpoint(hardpoint?: string): string {
  if (!hardpoint) return '';
  return hardpoint.padEnd(15, ' ');
}

/**
 * Format shot information
 */
function formatShotInfo(event: VisualEvent): string {
  if (event.data?.shotIndex !== undefined && event.data?.totalShots !== undefined) {
    return `(shot ${event.data.shotIndex + 1}/${event.data.totalShots})`;
  }
  return '';
}

/**
 * Display visual timeline for a single round
 */
function displayRoundTimeline() {
  console.log('='.repeat(80));
  console.log('AUGUR VISUAL EVENTS DEMONSTRATION');
  console.log('='.repeat(80));
  console.log();
  console.log(`Ship: ${augur.name} (${augur.classification})`);
  console.log(`Hardpoints: ${augurHardpoints.length}`);
  console.log();
  console.log('Timing Configuration:');
  console.log(`  Muzzle Flash Delay:     ${DEFAULT_TIMING.muzzleFlashDelay}ms`);
  console.log(`  Recoil Delay:           ${DEFAULT_TIMING.recoilDelay}ms`);
  console.log(`  Projectile Launch:      ${DEFAULT_TIMING.projectileLaunchDelay}ms`);
  console.log(`  Shot Interval:          ${DEFAULT_TIMING.shotInterval}ms`);
  console.log(`  Left Position Delay:    ${DEFAULT_TIMING.baseDelayByPosition.left}ms`);
  console.log(`  Right Position Delay:   ${DEFAULT_TIMING.baseDelayByPosition.right}ms`);
  console.log(`  Center Position Delay:  ${DEFAULT_TIMING.baseDelayByPosition.center}ms`);
  console.log();
  console.log('='.repeat(80));
  console.log();

  // Generate combat events for rounds 1-5
  const combatRounds = generateCombatEvents(augur, 1, 5);

  // Transform to visual events
  const visualTimelines = transformCombatToVisual(
    combatRounds,
    augur,
    augurHardpoints,
    DEFAULT_TIMING
  );

  // Display each round
  for (const timeline of visualTimelines) {
    console.log(`ROUND ${timeline.round}`);
    console.log('-'.repeat(80));
    console.log(`Duration: ${timeline.duration}ms`);
    console.log(`Events: ${timeline.events.length}`);
    console.log();

    // Display events in chronological order
    for (const event of timeline.events) {
      const timestamp = formatTimestamp(event.timestamp);
      const eventType = formatEventType(event.type);
      const hardpoint = formatHardpoint(event.hardpoint);
      const shotInfo = formatShotInfo(event);

      if (event.type === 'round_marker') {
        console.log(`${timestamp}  ${eventType}`);
      } else {
        console.log(`${timestamp}  ${eventType}  ${hardpoint}  ${shotInfo}`);
      }
    }

    console.log();
    console.log();
  }

  console.log('='.repeat(80));
  console.log('VISUAL EVENT FLOW EXAMPLE (Round 2)');
  console.log('='.repeat(80));
  console.log();
  console.log('The Augur fires all weapons in Round 2:');
  console.log();
  console.log('Timeline:');
  console.log('  0ms     → Round 2 begins');
  console.log('  0ms     → Left Beam: Recoil (shot 1)');
  console.log('  50ms    → Left Beam: Muzzle flash (shot 1)');
  console.log('  50ms    → Left Beam: Recoil (shot 2)');
  console.log('  100ms   → Left Beam: Projectile launch (shot 1)');
  console.log('  100ms   → Left Beam: Muzzle flash (shot 2)');
  console.log('  150ms   → Left Beam: Projectile launch (shot 2)');
  console.log('  200ms   → Right Beam: Recoil (shot 1)');
  console.log('  250ms   → Right Beam: Muzzle flash (shot 1)');
  console.log('  250ms   → Right Beam: Recoil (shot 2)');
  console.log('  300ms   → Right Beam: Projectile launch (shot 1)');
  console.log('  300ms   → Right Beam: Muzzle flash (shot 2)');
  console.log('  350ms   → Right Beam: Projectile launch (shot 2)');
  console.log('  400ms   → Obliterator: Recoil');
  console.log('  450ms   → Obliterator: Muzzle flash');
  console.log('  500ms   → Obliterator: Projectile launch');
  console.log();
  console.log('Notice:');
  console.log('  - Weapons fire in sequence (left → right → center)');
  console.log('  - Multi-shot weapons show individual shot timings');
  console.log('  - Each weapon has recoil → muzzle flash → projectile pattern');
  console.log('  - Position-based delays prevent visual overlap');
  console.log();
}

// Run the demo
displayRoundTimeline();
