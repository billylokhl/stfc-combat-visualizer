/**
 * Augur Validation Example
 *
 * Expected firing patterns based on hypothetical warmup/cooldown/shots values.
 * Observed data is PLACEHOLDER - needs real battle-log evidence.
 */

import type { ShipSourceData, ObservedFiringPattern } from '../types';

/**
 * Augur source data (HYPOTHETICAL - not extracted from stfc.space)
 */
export const augurSourceData: ShipSourceData = {
  shipId: 'augur',
  shipName: 'Augur',
  weapons: [
    {
      weaponId: 'augur_beam_left',
      weaponName: 'Beam Array (Left)',
      warmup: 0,
      cooldown: 1,
      shots: 2,
    },
    {
      weaponId: 'augur_beam_right',
      weaponName: 'Beam Array (Right)',
      warmup: 0,
      cooldown: 1,
      shots: 2,
    },
    {
      weaponId: 'augur_obliterator',
      weaponName: 'Obliterator Torpedo',
      warmup: 2,
      cooldown: 3,
      shots: 1,
    },
  ],
  source: 'HYPOTHETICAL - firing-pattern-analysis.md assumptions',
};

/**
 * Observed patterns (PLACEHOLDER - needs real battle-log data)
 *
 * How to attach battle-log evidence:
 *
 * 1. Screenshot Method:
 *    - Record STFC combat (PvE mission recommended for consistency)
 *    - Screenshot each round showing weapon firing
 *    - Manually note which weapons fire in each round
 *    - Update the `rounds` array below
 *    - Set source to "Player screenshot, [mission name], [date]"
 *    - Set confidence based on screenshot clarity
 *
 * 2. Video Method:
 *    - Record combat video at 60fps
 *    - Frame-step through video
 *    - Note weapon firing rounds and timestamps
 *    - Update the `rounds` array below
 *    - Set source to "Video analysis, [mission name], [date]"
 *    - Set confidence to 'high' if clear, 'medium' if ambiguous
 *
 * 3. Battle Log Method (if available):
 *    - Extract combat log from game or API
 *    - Parse firing events
 *    - Automatically populate `rounds` array
 *    - Set source to "Battle log, [date]"
 *    - Set confidence to 'high'
 *
 * Currently: All observed patterns are NULL (no battle-log data yet)
 */

/**
 * Left beam observed pattern (PLACEHOLDER)
 */
export const augurBeamLeftObserved: ObservedFiringPattern | null = null;

// EXAMPLE of what this would look like with real data:
// export const augurBeamLeftObserved: ObservedFiringPattern = {
//   weaponId: 'augur_beam_left',
//   rounds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
//   shotsPerFiring: 2,
//   source: 'Player screenshot, PvE mission "Alpha Quadrant Patrol", 2026-05-30',
//   confidence: 'high',
//   notes: 'Clear visual confirmation of 2-shot bursts every round',
// };

/**
 * Right beam observed pattern (PLACEHOLDER)
 */
export const augurBeamRightObserved: ObservedFiringPattern | null = null;

/**
 * Obliterator torpedo observed pattern (PLACEHOLDER)
 */
export const augurObliteratorObserved: ObservedFiringPattern | null = null;

// EXAMPLE of what this would look like with real data:
// export const augurObliteratorObserved: ObservedFiringPattern = {
//   weaponId: 'augur_obliterator',
//   rounds: [3, 6, 9, 12, 15],
//   shotsPerFiring: 1,
//   source: 'Video analysis (60fps), PvE mission "Alpha Quadrant Patrol", 2026-05-30',
//   confidence: 'high',
//   notes: 'Fires starting round 3, then every 3 rounds. Pattern matches warmup=2, cooldown=3.',
// };
