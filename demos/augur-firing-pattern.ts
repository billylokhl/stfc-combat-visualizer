#!/usr/bin/env node
/**
 * Augur Firing Pattern Demo
 *
 * Demonstrates the combat event model by generating and displaying
 * firing events for the Augur across 15 combat rounds.
 *
 * Usage:
 *   npm run demo:augur
 *   or
 *   ts-node --project tsconfig.demo.json demos/augur-firing-pattern.ts
 */

import { generateCombatEvents } from '@stfc-vi/combat-model';
import { augur } from '@stfc-vi/combat-model/examples';

/**
 * Format and display round events in a readable format
 */
function displayRoundEvents() {
  console.log('='.repeat(60));
  console.log('AUGUR FIRING PATTERN DEMONSTRATION');
  console.log('='.repeat(60));
  console.log();
  console.log(`Ship: ${augur.name} (${augur.classification})`);
  console.log(`Weapons: ${augur.weapons?.length || 0}`);
  console.log();

  // Generate events for rounds 1-15
  const roundEvents = generateCombatEvents(augur, 1, 15);

  // Display each round
  for (const round of roundEvents) {
    console.log(`Round ${round.round}`);
    console.log('-'.repeat(40));

    // Filter out round start/end events, show only weapon fires
    const weaponFires = round.events.filter(e => e.type === 'weapon_fired');

    if (weaponFires.length === 0) {
      console.log('  No weapons fired');
    } else {
      for (const event of weaponFires) {
        const shotText = event.shots === 1 ? 'shot' : 'shots';
        console.log(`  ${event.weaponName} fired (${event.shots} ${shotText})`);
      }
    }

    console.log();
  }

  console.log('='.repeat(60));
  console.log('PATTERN SUMMARY');
  console.log('='.repeat(60));
  console.log();

  if (augur.weapons) {
    for (const weapon of augur.weapons) {
      console.log(`${weapon.name}:`);

      if (weapon.firingSchedule.type === 'every_round') {
        console.log(`  Fires every round (${weapon.shotsPerActivation} shots)`);
      } else if (weapon.firingSchedule.type === 'interval') {
        console.log(`  Fires every ${weapon.firingSchedule.interval} rounds starting round ${weapon.firingSchedule.startRound}`);
        console.log(`  (${weapon.shotsPerActivation} shots per activation)`);
      }

      console.log();
    }
  }
}

// Run the demo
displayRoundEvents();
