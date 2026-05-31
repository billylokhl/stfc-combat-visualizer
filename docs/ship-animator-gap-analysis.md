# Ship Animator Gap Analysis

**Purpose**: Inventory of hardcoded assumptions, architecture gaps, and technical debt in Ship Animator v0.

**Last Updated**: May 31, 2026
**Status**: Engineering Prototype (Milestone 3)

---

## Executive Summary

Ship Animator v0 successfully validates the domain-model architecture:
- ✅ Domain models remain framework-agnostic
- ✅ Combat events flow from combat-model to visualization-model to renderer
- ✅ Layer separation is preserved
- ✅ Augur firing pattern renders correctly

**However**: The current implementation contains significant hardcoding and assumptions that must be addressed before production use.

**Gap Classification**:
- **Critical**: Blocks multi-ship support or breaks architecture
- **High**: Limits functionality or requires significant refactoring
- **Medium**: Reduces flexibility or maintainability
- **Low**: Minor improvements or polish

---

## Hardcoded Assumptions Inventory

### 1. Single Ship Only (Critical)

**Location**: `apps/ship-animator/src/App.tsx`

**What is hardcoded**:
```typescript
import { augur } from '@stfc-vi/combat-model/examples';

const combatEvents = generateCombatEvents(augur, 1, 15);
```

**Issue**: Application is hardcoded to the Augur ship. No ship selection, no other ships supported.

**What should come from domain models**:
- Ship selection UI (list of available ships)
- Ship definition from ship-model package
- Dynamic ship loading

**Impact**: Cannot visualize any ship except Augur without code changes.

**Effort to Fix**: Medium
- Add ship registry/catalog
- Create ship selection component
- Pass selected ship to combat event generator

**Priority**: High (blocks multi-ship visualization)

---

### 2. Fixed Round Range (High)

**Location**: `apps/ship-animator/src/App.tsx`

**What is hardcoded**:
```typescript
const combatEvents = generateCombatEvents(augur, 1, 15);
```

**Issue**: Combat simulation always runs rounds 1-15. No configuration for round count.

**What should come from domain models**:
- Round count configuration
- Start/end round selection

**Impact**: Cannot simulate longer or shorter battles.

**Effort to Fix**: Low
- Add round count input to UI
- Pass dynamic range to generateCombatEvents

**Priority**: Medium (nice-to-have feature)

---

### 3. Hardcoded Augur Label in Renderer (Medium)

**Location**: `apps/ship-animator/src/renderer/CanvasRenderer.ts`

**What is hardcoded**:
```typescript
renderShip(): void {
  // ...
  this.ctx.fillText('AUGUR', centerX, centerY + 5);
}
```

**Issue**: Ship name is hardcoded as "AUGUR" in renderer.

**What should come from domain models**:
- Ship name from ShipDefinition
- Passed to renderer as configuration

**Impact**: Displays wrong ship name when ship changes.

**Effort to Fix**: Trivial
- Pass ship name to CanvasRenderer constructor
- Use dynamic name in renderShip()

**Priority**: Low (minor visual bug)

---

### 4. Hardcoded Hardpoint Positions (Critical)

**Location**: `apps/ship-animator/src/renderer/CanvasRenderer.ts`

**What is hardcoded**:
```typescript
this.hardpoints = [
  { id: 'left_beam', x: centerX - 60, y: centerY, label: 'L' },
  { id: 'right_beam', x: centerX + 60, y: centerY, label: 'R' },
  { id: 'obliterator', x: centerX, y: centerY - 40, label: 'O' },
];
```

**Issue**: Hardpoint positions are hardcoded for Augur's specific layout. Different ships have different weapon configurations.

**What should come from domain models**:
- Hardpoint position mapping (from ship definition or visualization config)
- Dynamic hardpoint layout based on ship

**Impact**: Cannot render other ships correctly. Weapons would appear in wrong positions.

**Effort to Fix**: Medium
- Define hardpoint positions in visualization-model or ship-specific config
- Pass positions to CanvasRenderer
- Support variable number of hardpoints

**Priority**: High (blocks multi-ship support)

---

### 5. Hardcoded Timing Configuration (Medium)

**Location**: `apps/ship-animator/src/App.tsx`

**What is hardcoded**:
```typescript
const visualTimelines = transformCombatToVisual(
  combatEvents,
  augur,
  augurHardpoints,
  DEFAULT_TIMING  // ← Hardcoded timing constants
);
```

**Issue**: Visual timing (muzzle flash delay, shot intervals, etc.) uses hardcoded defaults from visualization-model.

**What should come from domain models**:
- Weapon-specific timing (beams vs torpedoes may have different visual timing)
- Ship-specific effects
- Configurable timing for different animation styles

**Impact**: All weapons use same visual timing. Limited visual variety.

**Effort to Fix**: Low-Medium
- Extend WeaponDefinition with optional visual timing overrides
- Support per-weapon or per-type timing configurations

**Priority**: Low (current defaults work, but limits polish)

---

### 6. Hardcoded Round Duration Assumption (Low)

**Location**: `apps/ship-animator/src/engine/PlaybackEngine.ts`

**What is hardcoded**:
```typescript
// Implicit assumption: each round timeline duration maps to real time
// No explicit round duration configuration
```

**Issue**: Round duration is implicitly derived from VisualRoundTimeline.duration. No override for speeding up/slowing down combat independently of playback speed.

**What should come from domain models**:
- Round duration configuration (default: 1 second per round)
- Decoupled from playback speed

**Impact**: Limited control over combat pacing.

**Effort to Fix**: Low
- Add round duration config to combat-model or visualization-model
- Scale timeline durations accordingly

**Priority**: Low (current behavior is acceptable)

---

### 7. No Defender Ship (Critical)

**Location**: Entire application

**What is hardcoded**:
- Single-ship visualization only
- No attacker vs defender concept
- No combat ordering between ships

**What should come from domain models**:
- Two-ship combat model (attacker and defender)
- Combat event ordering (attacker weapon 1, defender weapon 1, attacker weapon 2, etc.)
- Positional layout (attacker on left, defender on right)

**Impact**: Cannot visualize PvP combat. Fundamental architecture gap.

**Effort to Fix**: High
- Extend combat-model to support two ships
- Implement event ordering algorithm
- Update renderer for two-ship layout
- Create defender ship visual representation

**Priority**: High (required for PvP visualization)

---

## Renderer Responsibilities Analysis

### ✅ Renderer SHOULD Know (Currently Correct)

**Visual Effects**:
- ✅ Projectile rendering (position, movement, appearance)
- ✅ Muzzle flash animation
- ✅ Recoil animation
- ✅ Hardpoint visual state (active/inactive)

**Canvas Management**:
- ✅ Canvas size and resizing
- ✅ Coordinate system and positioning
- ✅ Frame rate and animation timing
- ✅ Visual debugging aids

**Scene Composition**:
- ✅ Ship visual representation
- ✅ Background rendering
- ✅ Effect layering

**Assessment**: Renderer correctly focuses on visual presentation without domain logic.

---

### ✅ Renderer SHOULD NOT Know (Currently Correct)

**Combat Logic**:
- ✅ Does NOT know warmup/cooldown semantics
- ✅ Does NOT know when weapons should fire
- ✅ Does NOT calculate firing patterns
- ✅ Does NOT implement combat rules

**Domain Concepts**:
- ✅ Does NOT know ship combat statistics
- ✅ Does NOT know damage calculations
- ✅ Does NOT know weapon types or classifications

**Timeline Generation**:
- ✅ Does NOT generate combat events
- ✅ Does NOT create visual timelines
- ✅ Consumes pre-generated VisualEvent[] only

**Assessment**: Renderer correctly delegates domain logic to model packages.

---

### ⚠️ Renderer Knows TOO MUCH (Architecture Violations)

**Augur-Specific Knowledge**:
- ❌ Hardcoded "AUGUR" label (should receive ship name)
- ❌ Hardcoded hardpoint positions (should receive configuration)
- ❌ Hardcoded hardpoint IDs: 'left_beam', 'right_beam', 'obliterator'

**Impact**: Renderer is tightly coupled to Augur ship structure.

**Fix**: Pass ship-specific configuration to renderer:
```typescript
interface ShipVisualConfig {
  shipName: string;
  hardpoints: Array<{
    id: string;
    position: { x: number; y: number };
    label: string;
  }>;
}

new CanvasRenderer(canvas, shipVisualConfig);
```

---

## Domain Model Consumption Analysis

### What Currently Comes from Domain Models ✅

**From ship-model**:
- ✅ Ship definition (id, name, classification, weapons)
- ✅ Weapon definitions (id, name, type, warmup, cooldown, shots)

**From combat-model**:
- ✅ Combat events (weapon_fired, round_start, round_end)
- ✅ Round-by-round event sequences

**From visualization-model**:
- ✅ Visual events (muzzle_flash, recoil, projectile_launch)
- ✅ Visual timelines (round-based event scheduling)
- ✅ Timing configurations (delays, intervals)

**Assessment**: Core domain separation is working correctly.

---

### What SHOULD Come from Domain Models (Gaps)

**Missing from ship-model**:
- ❌ Visual configuration (hardpoint positions, ship appearance)
- ❌ Ship catalog/registry for multi-ship support

**Missing from combat-model**:
- ❌ Two-ship combat support (attacker vs defender)
- ❌ Event ordering for multi-ship scenarios
- ❌ Combat sequencing rules

**Missing from visualization-model**:
- ❌ Ship-specific visual configs (currently only augurHardpoints example)
- ❌ Per-weapon visual timing overrides
- ❌ Visual effect type definitions

**Impact**: Limits extensibility and requires hardcoding in application layer.

---

## Architecture Gaps

### 1. No Ship Catalog (High Priority)

**Gap**: No central registry of available ships.

**Current State**: Augur is imported directly as a hardcoded example.

**Desired State**:
```typescript
import { shipCatalog } from '@stfc-vi/ship-model';

const availableShips = shipCatalog.getAll();
const selectedShip = shipCatalog.getById('augur');
```

**Effort**: Medium (create catalog, migrate examples)

---

### 2. No Visual Configuration System (High Priority)

**Gap**: Hardpoint positions and visual configs are scattered.

**Current State**:
- Hardpoint positions hardcoded in renderer
- `augurHardpoints` exists in visualization-model but isn't used systematically

**Desired State**:
```typescript
import { visualConfig } from '@stfc-vi/visualization-model';

const shipVisual = visualConfig.getForShip('augur');
// Returns: hardpoint positions, ship appearance, effect overrides
```

**Effort**: Medium (define config schema, create config files)

---

### 3. No Multi-Ship Combat Model (Critical Priority)

**Gap**: Combat model only supports single-ship event generation.

**Current State**:
```typescript
generateCombatEvents(ship: Ship, startRound: number, endRound: number)
```

**Desired State**:
```typescript
generateTwoShipCombat(
  attacker: Ship,
  defender: Ship,
  rounds: number,
  sequencing: 'interleaved' | 'attacker-first' | 'simultaneous'
)
```

**Effort**: High (requires combat ordering algorithm, event sequencing logic)

---

### 4. No Asset System (Low Priority)

**Gap**: No ship images, no weapon effect sprites, only geometric primitives.

**Current State**: Renderer uses ctx.fillRect() and ctx.arc() for all visuals.

**Desired State**:
- Ship images from asset-library package
- Weapon effect sprites (muzzle flashes, explosions)
- Projectile appearance definitions

**Effort**: High (asset creation, loading system, rendering pipeline)

**Note**: Current approach (primitives) is acceptable for engineering prototype.

---

## Recommended Remediation Roadmap

### Phase 1: Multi-Ship Foundation (High Priority)

**Tasks**:
1. Implement two-ship combat event generation (combat-model)
2. Add event ordering algorithm (attacker W1 → defender W1 → attacker W2 → etc.)
3. Create ship catalog system (ship-model)
4. Extract visual configs from renderer to visualization-model

**Deliverables**:
- `generateTwoShipCombat()` function
- Ship catalog with 3-5 example ships
- Visual configuration files for each ship
- Updated Ship Animator supporting ship selection

**Timeline**: 1-2 weeks

---

### Phase 2: Visual Configuration (Medium Priority)

**Tasks**:
1. Define visual config schema (hardpoint positions, ship appearance)
2. Create config files for existing ships
3. Update renderer to consume configs instead of hardcoded values
4. Add visual config validation

**Deliverables**:
- Visual config schema documentation
- Config files for Augur + 2 additional ships
- Dynamic renderer supporting any ship config

**Timeline**: 1 week

---

### Phase 3: Polish & Flexibility (Low Priority)

**Tasks**:
1. Add round count configuration UI
2. Implement per-weapon visual timing overrides
3. Add playback duration controls
4. Improve debug visualizations

**Deliverables**:
- Configurable round count
- Visual variety (different timing for beams vs torpedoes)
- Enhanced playback controls

**Timeline**: 1 week

---

### Phase 4: Asset System (Future)

**Tasks**:
1. Design asset-library package structure
2. Create ship images (or placeholders)
3. Create weapon effect sprites
4. Implement asset loading system
5. Update renderer to use assets instead of primitives

**Deliverables**:
- Asset-library package with example assets
- Image-based rendering pipeline
- Visual polish

**Timeline**: 2-3 weeks

**Note**: Deferred until core functionality is complete.

---

## Testing Recommendations

### Current Test Coverage: ❌ None

**Gap**: No automated tests for Ship Animator.

**Recommended Test Strategy**:

**Unit Tests** (domain models):
- ✅ Already validated via demos (npm run demo:augur, demo:visual)
- Consider adding Jest tests for edge cases

**Integration Tests** (playback engine):
- Test timeline playback correctness
- Test speed changes and pause/resume
- Verify round transitions

**Visual Regression Tests**:
- Capture reference frames for Augur animation
- Compare output after changes
- Tools: Playwright visual comparison, Percy, Chromatic

**Manual Testing**:
- ✅ Currently performed (visual inspection of rendered output)
- Create manual test checklist for new ships

---

## Related Documentation

- [Architecture](architecture.md) - Package responsibilities and constraints
- [Weapon Lifecycle](weapon-lifecycle.md) - Domain model semantics
- [Domain Notes](domain-notes.md) - Confirmed facts and assumptions
- [Ship Animator v0 Specification](ship-animator-v0.md) - Original milestone requirements
