# @stfc-vi/domain-validation

Domain assumption validation framework for STFC combat mechanics.

## Purpose

Validate combat model assumptions against real-world evidence:
- Compare expected firing patterns (derived from warmup/cooldown/shots) to observed patterns (battle logs)
- Track validation status of domain assumptions
- Provide infrastructure for future validation work

## What This Package Does

1. **Defines validation data structures**: Types for source data, expected patterns, and observed patterns
2. **Provides comparison framework**: Tools to compare expected vs. observed firing sequences
3. **Generates validation reports**: Human-readable summaries of validation results

## What This Package Does NOT Do

- ❌ Scrape websites or parse battle logs (manual data entry only)
- ❌ Modify combat model or ship definitions
- ❌ Make architectural decisions (reports only)

## Usage

```typescript
import {
  WeaponSourceData,
  ExpectedFiringPattern,
  ObservedFiringPattern,
  ValidationResult,
  validateFiringPattern,
  generateValidationReport,
} from '@stfc-vi/domain-validation';

// Define source data (from stfc.space)
const weaponData: WeaponSourceData = {
  weaponId: 'augur_beam_left',
  warmup: 1,
  cooldown: 1,
  shots: 2,
};

// Derive expected pattern
const expected: ExpectedFiringPattern = {
  weaponId: 'augur_beam_left',
  rounds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  shotsPerFiring: 2,
};

// Enter observed data (from battle log)
const observed: ObservedFiringPattern = {
  weaponId: 'augur_beam_left',
  rounds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  shotsPerFiring: 2,
  source: 'Player screenshot, PvE mission 2026-05-30',
};

// Validate
const result = validateFiringPattern(expected, observed);
// result.matches: boolean
// result.differences: string[]

// Generate report
const report = generateValidationReport([result]);
// Outputs human-readable summary
```

## Framework-Agnostic

This package has **zero dependencies** on:
- React
- Canvas
- Browser APIs
- UI frameworks

It is pure TypeScript domain logic.

## Integration

Used by:
- `demos/domain-validation.ts` - Example validation reports
- Future battle-log analysis tools (when data sources become available)

Does NOT affect:
- `combat-model` (continues to use current FiringSchedule)
- `visualization-model` (unchanged)
- `ship-animator` (unchanged)

## Status

**Milestone 5**: Initial framework created, no battle-log data yet.

Validation infrastructure is ready. Waiting for:
1. Battle-log data sources (screenshots, player reports, or API)
2. Methodology for extracting firing sequences from logs
