# Domain Realignment Summary

**Date**: May 31, 2026  
**Status**: ✅ Complete  
**Commits**: 4 (028761b, 6f087e7, 8786678, 671c025)

---

## Overview

Comprehensive domain realignment pass completed before Ship Animator v1 implementation. All 5 parts delivered with validation evidence.

**Goal**: Ensure documentation and code reflect current understanding of STFC weapon behavior without adding new features.

**Outcome**: Domain model semantics corrected, documentation clarified, warmup bug fixed, two-ship combat ordering implemented.

---

## Deliverables Completed

### Part 1: Domain Correction Pass ✅

**Updated Documentation**:
- [docs/domain-notes.md](domain-notes.md)
- [docs/combat-assumptions.md](combat-assumptions.md)
- [docs/architecture.md](architecture.md)
- [docs/migration-criteria.md](migration-criteria.md)

**Changes**:
1. **Warmup Semantics Corrected**
   - BEFORE: "warmup = delay before first fire"
   - AFTER: "warmup = round number when weapon first fires"
   - Examples: warmup=1 → round 1, warmup=2 → round 2

2. **Weapon Lifecycle Documented**
   - States: Charging and Firing (no Idle state)
   - Charging: during warmup and cooldown periods
   - Firing: weapon activates and fires shots

3. **Activation vs Shot Clarified**
   - Activation: weapon becomes active (1 event per round)
   - Shot: individual projectile (multiple per activation)
   - Example: shots=4 → one activation with four shots

4. **Combat Ordering Assumption Documented**
   - Interleaved weapon slot pattern (A-W1, D-W1, A-W2, D-W2...)
   - Accepted for visualization purposes
   - Can be revised with battle-log data

5. **Migration Planning Archived**
   - migration-criteria.md marked obsolete
   - Migration completed in Milestone 6
   - Retained for historical reference

**Commit**: 6f087e7

---

### Part 2: Weapon Lifecycle Reference ✅

**New Document**: [docs/weapon-lifecycle.md](weapon-lifecycle.md)

**Contents**:
- Source data model (warmup/cooldown/shots)
- Lifecycle states (Charging/Firing)
- Firing algorithm explanation
- Real-world Augur examples
- Activation vs Shot distinction
- Visualization implications
- Developer guidelines

**Purpose**: Single canonical reference for weapon timing behavior

**Commit**: 028761b

---

### Part 3: Ship Animator Gap Analysis ✅

**New Document**: [docs/ship-animator-gap-analysis.md](ship-animator-gap-analysis.md)

**Contents**:
- Hardcoded assumptions inventory (7 identified)
- Architecture gap analysis (4 gaps)
- Renderer responsibility assessment
- Domain model consumption analysis
- Remediation roadmap (4 phases)
- Testing recommendations

**Key Findings**:

**Hardcoded Items**:
1. Single ship only (Augur) - CRITICAL
2. Fixed round range (1-15) - HIGH
3. Hardcoded ship label ("AUGUR") - MEDIUM
4. Hardcoded hardpoint positions - CRITICAL
5. Hardcoded timing config - MEDIUM
6. Round duration assumption - LOW
7. No defender ship - CRITICAL

**Architecture Gaps**:
1. No ship catalog - HIGH
2. No visual config system - HIGH
3. No multi-ship combat model - CRITICAL (✅ now addressed)
4. No asset system - LOW

**Assessment**: Core architecture is sound. Layer separation preserved. Gaps are primarily in extensibility, not fundamentals.

**Commit**: 028761b

---

### Part 4: Warmup Bug Fix ✅

**Bug Identified**:
```typescript
// BEFORE (incorrect):
const firstRound = 1 + weapon.warmup;
// warmup=0 → round 1 ✓ (correct by accident)
// warmup=1 → round 2 ✗ (WRONG - should be round 1)
// warmup=2 → round 3 ✗ (WRONG - should be round 2)

// AFTER (correct):
const firstRound = weapon.warmup || 1;
// warmup=1 → round 1 ✓
// warmup=2 → round 2 ✓
// warmup=3 → round 3 ✓
```

**Files Changed**:
- `packages/combat-model/src/index.ts` - Algorithm fix
- `packages/combat-model/src/examples/augur.ts` - Updated values
  - Beams: warmup 0→1
  - Obliterator: warmup 1→2

**Validation**:
```bash
npm run demo:augur
```

**Before Fix**:
- Beams: rounds 1,2,3,4,5... ✓
- Obliterator: rounds 2,5,8,11,14... ✓

**After Fix**:
- Beams: rounds 1,2,3,4,5... ✓ (unchanged behavior)
- Obliterator: rounds 2,5,8,11,14... ✓ (unchanged behavior)

**Result**: Semantics corrected, user-visible behavior preserved.

**Commit**: 8786678

---

### Part 5: Combat Event Ordering ✅

**Implementation**: Two-ship combat with interleaved weapon slot ordering

**New Functionality**:

```typescript
export type ShipRole = 'attacker' | 'defender';

export interface CombatEvent {
  // ... existing fields
  shipId?: string;    // NEW
  role?: ShipRole;    // NEW
}

export function generateTwoShipCombat(
  attacker: Ship,
  defender: Ship,
  rounds: number
): RoundEvents[]
```

**Ordering Algorithm**:
```
For each round:
  For each weapon slot (0 to max):
    If attacker has weapon at slot and fires:
      Generate attacker weapon_fired event
    If defender has weapon at slot and fires:
      Generate defender weapon_fired event
```

**Result**:
- Attacker W1 → Defender W1
- Attacker W2 → Defender W2
- Attacker W3 → Defender W3
- (Skip missing slots)

**New Demo**: `demos/two-ship-combat.ts`

**Validation**:
```bash
npm run demo:two-ship
```

**Output** (Round 2 example):
```
[ATK] Left Beam fired (2 shots)
[DEF] Left Beam fired (2 shots)
[ATK] Right Beam fired (2 shots)
[DEF] Right Beam fired (2 shots)
[ATK] Obliterator fired (1 shot)
[DEF] Obliterator fired (1 shot)
```

**Design Notes**:
- No damage simulation (visualization only)
- Single-ship functions unchanged (backward compatible)
- Event ordering based on weapon array position
- Assumption accepted for Ship Animator v1
- Can be revised with battle-log data

**Commit**: 671c025

---

## Files Changed Summary

### New Files (3)
- `docs/weapon-lifecycle.md` - Canonical weapon timing reference
- `docs/ship-animator-gap-analysis.md` - Technical debt inventory
- `demos/two-ship-combat.ts` - Two-ship combat demonstration

### Modified Files (8)
- `docs/domain-notes.md` - Warmup semantics, lifecycle states, ordering assumption
- `docs/combat-assumptions.md` - Warmup semantics correction
- `docs/architecture.md` - Algorithm fix, lifecycle documentation
- `docs/migration-criteria.md` - Marked obsolete
- `packages/combat-model/src/index.ts` - Warmup fix + two-ship combat
- `packages/combat-model/src/examples/augur.ts` - Warmup values updated
- `package.json` - Added demo:two-ship script
- `demos/augur-firing-pattern.ts` - (User-modified, no changes by agent)

---

## Assumptions Updated

### Confirmed ✅
1. **Warmup is round number** (not delay)
2. **Weapons have Charging/Firing states** (no Idle)
3. **Activation ≠ Shot** (one activation → N shots)

### Accepted for Visualization 🎯
4. **Interleaved weapon slot ordering** (A-W1, D-W1, A-W2, D-W2...)
   - Confidence: 60% (community knowledge)
   - Status: Accepted working assumption for Ship Animator v1
   - Validation: Revisit with battle-log data

### Still Hypothetical 🔬
5. **Weapon listing order determines firing** (same-warmup weapons)
   - Confidence: 70%
   - Evidence: 5/5 ships analyzed
6. **Round duration = 1 second**
   - Confidence: 50%
   - Evidence: Value alignment only

---

## Bugs Fixed

### 1. Warmup Semantics Bug ✅

**Impact**: HIGH (semantic correctness)

**User-Visible**: None (Augur pattern unchanged)

**Technical**: Warmup interpretation corrected

**Before**:
- warmup=1 fired in round 2 (off-by-one)
- Worked for Augur only because we compensated with wrong values

**After**:
- warmup=N fires in round N (correct semantics)
- Augur values updated to match semantics
- Pattern unchanged: rounds 2,5,8,11,14 (Obliterator)

---

## Architectural Observations

### Strengths ✅
1. **Layer separation preserved**
   - Domain models remain framework-agnostic
   - Renderer consumes events, doesn't generate them
   - Combat logic isolated from visualization

2. **Backward compatibility maintained**
   - Single-ship functions unchanged
   - Existing demos still work
   - No breaking changes to Ship Animator v0

3. **Extensibility added**
   - Two-ship combat support
   - Role-based event generation
   - Foundation for multi-ship visualization

### Gaps Identified 📋
1. **Ship catalog needed** (no central registry)
2. **Visual config system needed** (hardpoint positions scattered)
3. **Asset system missing** (only geometric primitives)
4. **Testing infrastructure minimal** (manual validation only)

**See**: [docs/ship-animator-gap-analysis.md](ship-animator-gap-analysis.md) for full analysis and remediation roadmap.

---

## Validation Evidence

### Demo Outputs Captured ✓

**Single-Ship Combat** (`npm run demo:augur`):
```
Round 1: Left Beam (2), Right Beam (2)
Round 2: Left Beam (2), Right Beam (2), Obliterator (1)
Round 3: Left Beam (2), Right Beam (2)
...
Round 5: Left Beam (2), Right Beam (2), Obliterator (1)
```
Pattern: Beams every round, Obliterator rounds 2,5,8,11,14 ✓

**Two-Ship Combat** (`npm run demo:two-ship`):
```
Round 1:
  [ATK] Left Beam (2)
  [DEF] Left Beam (2)
  [ATK] Right Beam (2)
  [DEF] Right Beam (2)

Round 2:
  [ATK] Left Beam (2)
  [DEF] Left Beam (2)
  [ATK] Right Beam (2)
  [DEF] Right Beam (2)
  [ATK] Obliterator (1)
  [DEF] Obliterator (1)
```
Pattern: Interleaved slot ordering confirmed ✓

**Visual Events** (`npm run demo:visual`):
- Visualization layer unchanged ✓
- Visual timelines generated correctly ✓
- No regression ✓

---

## Recommended Next Milestone

### Ship Animator v1 Prerequisites

**Now Ready**:
1. ✅ Domain model semantics corrected
2. ✅ Two-ship combat event generation
3. ✅ Combat ordering algorithm implemented
4. ✅ Documentation comprehensive and accurate

**Still Needed Before Implementation**:
1. **Ship Catalog System**
   - Create ship registry
   - Add 2-3 more example ships
   - Ship selection UI
   - **Priority**: HIGH

2. **Visual Configuration System**
   - Extract hardpoint positions to config files
   - Create visual config schema
   - Per-ship visual configs
   - **Priority**: HIGH

3. **Two-Ship Renderer**
   - Extend CanvasRenderer for two ships
   - Positional layout (attacker left, defender right)
   - Ship-specific visual rendering
   - **Priority**: HIGH

4. **Architecture Cleanup**
   - Remove hardcoded "AUGUR" label
   - Dynamic hardpoint rendering
   - Ship name from config
   - **Priority**: MEDIUM

**Suggested Milestone Structure**:

**Milestone 7: Ship Animator v1 - Foundation**
- Ship catalog system (3-5 ships)
- Visual configuration system
- Ship selection UI
- Deliverable: Select any ship, view single-ship combat

**Milestone 8: Ship Animator v1 - Two-Ship Combat**
- Two-ship renderer layout
- Two-ship visualization pipeline
- Combat ordering visual validation
- Deliverable: Two-ship PvP visualization

**Milestone 9: Ship Animator v1 - Polish**
- Enhanced visual effects
- Charging state animation
- Playback controls refinement
- Deliverable: Production-ready Ship Animator v1

---

## Documentation Status

### New Documentation
- ✅ [weapon-lifecycle.md](weapon-lifecycle.md) - Canonical timing reference
- ✅ [ship-animator-gap-analysis.md](ship-animator-gap-analysis.md) - Technical debt inventory

### Updated Documentation
- ✅ [domain-notes.md](domain-notes.md) - Semantics corrected, assumptions updated
- ✅ [combat-assumptions.md](combat-assumptions.md) - Warmup semantics fixed
- ✅ [architecture.md](architecture.md) - Algorithm documented, lifecycle added

### Archived Documentation
- ✅ [migration-criteria.md](migration-criteria.md) - Marked obsolete (migration complete)

### Discovery & Navigation
**All domain knowledge now discoverable through**:
1. `docs/domain-notes.md` - Start here for confirmed facts
2. `docs/weapon-lifecycle.md` - Deep dive on weapon timing
3. `docs/combat-assumptions.md` - Assumption registry with confidence
4. `docs/ship-animator-gap-analysis.md` - Implementation gaps
5. `docs/architecture.md` - System design principles

---

## Git History

```
671c025 feat: Add two-ship combat with interleaved weapon slot ordering
8786678 fix: Correct warmup semantics in combat model
6f087e7 docs: Correct warmup semantics and clarify domain concepts
028761b docs: Add weapon lifecycle and Ship Animator gap analysis
```

**All commits**: Small, reviewable, focused

**Validation**: Each commit independently validated with demos

---

## Conclusion

✅ **All 5 parts completed successfully**

**Domain Model**: Semantically correct and well-documented

**Architecture**: Sound with clear extensibility path

**Technical Debt**: Identified and prioritized

**Bugs**: Fixed with validation evidence

**Next Steps**: Ship Animator v1 implementation roadmap defined

**Quality**: Clean commits, comprehensive documentation, validated with demos

**Ready**: For Ship Animator v1 development
