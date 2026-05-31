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
      console.log(`  Type: ${weapon.type}`);
      console.log(`  Warmup: ${weapon.warmup} rounds`);
      console.log(`  Cooldown: ${weapon.cooldown} rounds`);
      console.log(`  Shots: ${weapon.shots} per activation`);

      // Calculate first firing round (warmup is the round number, not a delay)
      const firstRound = weapon.warmup || 1;
      console.log(`  → Fires starting round ${firstRound}, then every ${weapon.cooldown} rounds`);

      console.log();
    }
  }
}

// Run the demo
displayRoundEvents();
