#!/usr/bin/env node
/**
 * Two-Ship Combat Demo
 *
 * Demonstrates interleaved weapon slot ordering for PvP combat.
 *
 * Usage:
 *   npm run demo:two-ship
 *   or
 *   ts-node --project tsconfig.demo.json demos/two-ship-combat.ts
 */

import { generateTwoShipCombat } from '@stfc-vi/combat-model';
import { getShipById } from '@stfc-vi/visualization-model/examples';
import type { Ship } from '@stfc-vi/ship-model';

const augurEntry = getShipById('augur');
const augur = augurEntry?.ship as Ship;

// Create a second ship (simplified Augur variant for demo)
const augurDefender: Ship = {
  ...augur,
  id: 'augur-defender',
  name: 'Augur (Defender)',
  // Keep same weapons for simplicity
};

/**
 * Format and display two-ship combat events
 */
function displayTwoShipCombat() {
  console.log('='.repeat(70));
  console.log('TWO-SHIP COMBAT DEMONSTRATION');
  console.log('='.repeat(70));
  console.log();
  console.log(`Attacker: ${augur.name} (${augur.id})`);
  console.log(`Defender: ${augurDefender.name} (${augurDefender.id})`);
  console.log();
  console.log('Combat Ordering: Interleaved Weapon Slots');
  console.log('  - Attacker W1 → Defender W1 → Attacker W2 → Defender W2 → ...');
  console.log();

  // Generate combat events for rounds 1-5 (shorter for readability)
  const combatRounds = generateTwoShipCombat(augur, augurDefender, 5);

  // Display each round
  for (const round of combatRounds) {
    console.log(`Round ${round.round}`);
    console.log('-'.repeat(70));

    // Filter weapon fire events
    const weaponFires = round.events.filter(e => e.type === 'weapon_fired');

    if (weaponFires.length === 0) {
      console.log('  No weapons fired');
    } else {
      for (const event of weaponFires) {
        const roleLabel = event.role === 'attacker' ? '[ATK]' : '[DEF]';
        const shotText = event.shots === 1 ? 'shot' : 'shots';
        console.log(
          `  ${roleLabel} ${event.weaponName} fired (${event.shots} ${shotText})`
        );
      }
    }

    console.log();
  }

  console.log('='.repeat(70));
  console.log('WEAPON SLOT ANALYSIS');
  console.log('='.repeat(70));
  console.log();
  console.log('Attacker Weapons (by slot):');
  if (augur.weapons) {
    augur.weapons.forEach((w, idx) => {
      console.log(`  Slot ${idx + 1}: ${w.name} (warmup=${w.warmup}, cooldown=${w.cooldown})`);
    });
  }
  console.log();
  console.log('Defender Weapons (by slot):');
  if (augurDefender.weapons) {
    augurDefender.weapons.forEach((w, idx) => {
      console.log(`  Slot ${idx + 1}: ${w.name} (warmup=${w.warmup}, cooldown=${w.cooldown})`);
    });
  }
  console.log();
  console.log('Firing Order Pattern:');
  console.log('  1. Attacker Slot 1 (Left Beam)');
  console.log('  2. Defender Slot 1 (Left Beam)');
  console.log('  3. Attacker Slot 2 (Right Beam)');
  console.log('  4. Defender Slot 2 (Right Beam)');
  console.log('  5. Attacker Slot 3 (Obliterator)');
  console.log('  6. Defender Slot 3 (Obliterator)');
  console.log();
  console.log('Note: Weapons only fire when their warmup/cooldown timing allows.');
  console.log();
}

// Run the demo
displayTwoShipCombat();
