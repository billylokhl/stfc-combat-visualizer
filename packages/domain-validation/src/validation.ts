/**
 * Validation Logic
 *
 * Compare expected vs. observed firing patterns.
 */

import type {
  ExpectedFiringPattern,
  ObservedFiringPattern,
  ValidationResult,
  WeaponSourceData,
} from './types';

/**
 * Derive expected firing pattern from warmup/cooldown/shots
 */
export function deriveExpectedPattern(
  weapon: WeaponSourceData,
  maxRounds: number = 15
): ExpectedFiringPattern {
  const rounds: number[] = [];
  const firstRound = 1 + weapon.warmup;

  for (let round = 1; round <= maxRounds; round++) {
    if (round < firstRound) continue;

    // Fire on first round, then every cooldown rounds
    if (round === firstRound || (round - firstRound) % weapon.cooldown === 0) {
      rounds.push(round);
    }
  }

  return {
    weaponId: weapon.weaponId,
    rounds,
    shotsPerFiring: weapon.shots,
    derivationMethod: 'warmup/cooldown algorithm',
  };
}

/**
 * Compare expected vs. observed firing patterns
 */
export function validateFiringPattern(
  expected: ExpectedFiringPattern,
  observed: ObservedFiringPattern | null
): ValidationResult {
  if (!observed) {
    return {
      weaponId: expected.weaponId,
      matches: false,
      differences: ['No observed data available'],
      expected,
      observed: null,
    };
  }

  const differences: string[] = [];
  let matches = true;

  // Compare rounds
  const expectedRounds = new Set(expected.rounds);
  const observedRounds = new Set(observed.rounds);

  // Find missing rounds (expected but not observed)
  const missingRounds = expected.rounds.filter((r) => !observedRounds.has(r));
  if (missingRounds.length > 0) {
    differences.push(
      `Expected firing in rounds ${missingRounds.join(', ')} but not observed`
    );
    matches = false;
  }

  // Find extra rounds (observed but not expected)
  const extraRounds = observed.rounds.filter((r) => !expectedRounds.has(r));
  if (extraRounds.length > 0) {
    differences.push(
      `Observed firing in rounds ${extraRounds.join(', ')} but not expected`
    );
    matches = false;
  }

  // Compare shots per firing (if observed)
  if (
    observed.shotsPerFiring !== undefined &&
    observed.shotsPerFiring !== expected.shotsPerFiring
  ) {
    differences.push(
      `Expected ${expected.shotsPerFiring} shots per firing, observed ${observed.shotsPerFiring}`
    );
    matches = false;
  }

  // Note low confidence observations
  if (observed.confidence === 'low' && matches) {
    differences.push(
      'Match found, but observed data has low confidence - needs re-validation'
    );
  }

  return {
    weaponId: expected.weaponId,
    matches,
    differences: differences.length > 0 ? differences : ['Perfect match'],
    expected,
    observed,
  };
}

/**
 * Generate human-readable validation report
 */
export function generateValidationReport(
  results: ValidationResult[]
): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('FIRING PATTERN VALIDATION REPORT');
  lines.push('='.repeat(60));
  lines.push('');

  for (const result of results) {
    lines.push(`Weapon: ${result.weaponId}`);
    lines.push(`Status: ${result.matches ? '✅ MATCH' : '❌ MISMATCH'}`);
    lines.push('');

    lines.push('Expected Pattern:');
    lines.push(
      `  Rounds: ${result.expected.rounds.join(', ') || 'never fires'}`
    );
    lines.push(`  Shots per firing: ${result.expected.shotsPerFiring}`);
    lines.push(`  Derivation: ${result.expected.derivationMethod}`);
    lines.push('');

    if (result.observed) {
      lines.push('Observed Pattern:');
      lines.push(
        `  Rounds: ${result.observed.rounds.join(', ') || 'never observed'}`
      );
      if (result.observed.shotsPerFiring !== undefined) {
        lines.push(`  Shots per firing: ${result.observed.shotsPerFiring}`);
      }
      lines.push(`  Source: ${result.observed.source}`);
      lines.push(`  Confidence: ${result.observed.confidence}`);
      if (result.observed.notes) {
        lines.push(`  Notes: ${result.observed.notes}`);
      }
      lines.push('');
    } else {
      lines.push('Observed Pattern: No data available');
      lines.push('');
    }

    lines.push('Differences:');
    for (const diff of result.differences) {
      lines.push(`  - ${diff}`);
    }
    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('');
  }

  // Summary
  const totalWeapons = results.length;
  const matchedWeapons = results.filter((r) => r.matches).length;
  const unvalidatedWeapons = results.filter((r) => !r.observed).length;

  lines.push('SUMMARY');
  lines.push('='.repeat(60));
  lines.push(`Total weapons: ${totalWeapons}`);
  lines.push(`Validated matches: ${matchedWeapons}`);
  lines.push(`Mismatches: ${totalWeapons - matchedWeapons - unvalidatedWeapons}`);
  lines.push(`Unvalidated (no data): ${unvalidatedWeapons}`);
  lines.push('');

  return lines.join('\n');
}
