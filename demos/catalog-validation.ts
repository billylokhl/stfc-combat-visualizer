#!/usr/bin/env node
import { listShips } from '@stfc-vi/visualization-model/examples';
import type { Ship } from '@stfc-vi/ship-model';
import { weaponFiresOnRound } from '@stfc-vi/combat-model';

function printShip(shipEntry: any) {
  console.log('='.repeat(60));
  console.log(`Ship: ${shipEntry.name} (${shipEntry.id})`);
  const ship: Ship | undefined = shipEntry.ship;
  if (!ship) {
    console.log('  No domain ship definition available (placeholder)');
    return;
  }
  console.log(`  Weapons: ${ship.weapons?.length || 0}`);
  for (const w of ship.weapons || []) {
    console.log(`  - ${w.name} (id=${w.id}) warmup=${w.warmup} cooldown=${w.cooldown} shots=${w.shots}`);
    const rounds: number[] = [];
    for (let r = 1; r <= 15; r++) {
      if (weaponFiresOnRound(w as any, r)) rounds.push(r);
    }
    console.log(`    Derived rounds (1-15): ${rounds.join(', ')}`);
  }
}

function main() {
  const ships = listShips();
  console.log('Ship Catalog Validation');
  for (const entry of ships) {
    printShip(entry);
  }
}

main();
