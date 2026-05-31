/**
 * Domain Validation Demo
 *
 * Demonstrates validation framework with example ships.
 * Currently shows expected patterns with placeholder observed data.
 */

import {
  deriveExpectedPattern,
  validateFiringPattern,
  generateValidationReport,
  augurSourceData,
  augurBeamLeftObserved,
  augurBeamRightObserved,
  augurObliteratorObserved,
  vengeanceSourceData,
  vengeancePhotonObserved,
  vengeancePhaserObserved,
  vengeancePulseObserved,
  vengeanceQuantumObserved,
  kelvinSourceData,
  kelvinPhaser1Observed,
  kelvinPhaser2Observed,
  kelvinKineticObserved,
  kelvinPhotonObserved,
} from '@stfc-vi/domain-validation';

import type { ValidationResult, ShipSourceData } from '@stfc-vi/domain-validation';

/**
 * Validate a ship's firing patterns
 */
function validateShip(
  shipData: ShipSourceData,
  observedPatterns: Array<any | null>
): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (let i = 0; i < shipData.weapons.length; i++) {
    const weapon = shipData.weapons[i];
    const observed = observedPatterns[i];

    // Derive expected pattern from source data
    const expected = deriveExpectedPattern(weapon, 15);

    // Validate against observed data (if available)
    const result = validateFiringPattern(expected, observed);

    results.push(result);
  }

  return results;
}

/**
 * Main demo
 */
function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       STFC DOMAIN VALIDATION FRAMEWORK - DEMO REPORT       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('Purpose: Validate warmup/cooldown/shots derivation hypothesis');
  console.log('Status: Framework ready, awaiting battle-log data');
  console.log('Ships analyzed: Augur, Vengeance, Kelvin');
  console.log('\n');

  // Augur validation
  console.log('═'.repeat(60));
  console.log('SHIP: AUGUR');
  console.log('═'.repeat(60));
  console.log('\n');

  const augurResults = validateShip(augurSourceData, [
    augurBeamLeftObserved,
    augurBeamRightObserved,
    augurObliteratorObserved,
  ]);

  console.log(generateValidationReport(augurResults));

  // Vengeance validation
  console.log('═'.repeat(60));
  console.log('SHIP: VENGEANCE');
  console.log('═'.repeat(60));
  console.log('\n');

  const vengeanceResults = validateShip(vengeanceSourceData, [
    vengeancePhotonObserved,
    vengeancePhaserObserved,
    vengeancePulseObserved,
    vengeanceQuantumObserved,
  ]);

  console.log(generateValidationReport(vengeanceResults));

  // Kelvin validation
  console.log('═'.repeat(60));
  console.log('SHIP: KELVIN');
  console.log('═'.repeat(60));
  console.log('\n');

  const kelvinResults = validateShip(kelvinSourceData, [
    kelvinPhaser1Observed,
    kelvinPhaser2Observed,
    kelvinKineticObserved,
    kelvinPhotonObserved,
  ]);

  console.log(generateValidationReport(kelvinResults));

  // Overall summary
  console.log('═'.repeat(60));
  console.log('OVERALL VALIDATION STATUS');
  console.log('═'.repeat(60));
  console.log('\n');

  const allResults = [...augurResults, ...vengeanceResults, ...kelvinResults];
  const totalWeapons = allResults.length;
  const validatedWeapons = allResults.filter((r) => r.observed !== null).length;
  const matchedWeapons = allResults.filter((r) => r.matches).length;

  console.log(`Total weapons across all ships: ${totalWeapons}`);
  console.log(`Weapons with observed data: ${validatedWeapons}`);
  console.log(`Weapons with no data yet: ${totalWeapons - validatedWeapons}`);
  console.log(`Validated matches: ${matchedWeapons}`);
  console.log(
    `Validation coverage: ${((validatedWeapons / totalWeapons) * 100).toFixed(1)}%`
  );
  console.log('\n');

  console.log('═'.repeat(60));
  console.log('NEXT STEPS');
  console.log('═'.repeat(60));
  console.log('\n');
  console.log('To populate observed data:');
  console.log('  1. Record STFC combat (PvE missions recommended)');
  console.log('  2. Screenshot or video-analyze weapon firing rounds');
  console.log('  3. Update packages/domain-validation/src/examples/*.ts');
  console.log('  4. Replace null values with ObservedFiringPattern objects');
  console.log('  5. Re-run this demo to see validation results');
  console.log('\n');
  console.log('See packages/domain-validation/src/examples/augur.ts for');
  console.log('detailed instructions on attaching battle-log evidence.');
  console.log('\n');

  console.log('═'.repeat(60));
  console.log('ASSUMPTION IMPACT');
  console.log('═'.repeat(60));
  console.log('\n');
  console.log('If all weapons validate successfully:');
  console.log('  ✅ ASSUMPTION-001 (warmup/cooldown derivability) confirmed');
  console.log('  ✅ Migration to warmup/cooldown/shots recommended');
  console.log('  ✅ FiringSchedule becomes derived construct');
  console.log('\n');
  console.log('If any weapon fails validation:');
  console.log('  ❌ ASSUMPTION-001 partially contradicted');
  console.log('  ⚠️  Need hybrid model (warmup/cooldown + manual FiringSchedule)');
  console.log('  ⏸️  Defer migration until edge cases understood');
  console.log('\n');

  console.log('See docs/combat-assumptions.md for full assumption registry.');
  console.log('See docs/migration-criteria.md for migration decision criteria.');
  console.log('\n');
}

main();
