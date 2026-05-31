# STFC Domain Notes

**Purpose**: Capture combat domain knowledge, discoveries, assumptions, and open questions to guide architectural decisions.

**Last Updated**: May 30, 2026

---

## Confirmed Discoveries

### 1. Weapons Have Warmup
**Evidence**: Direct observation from stfc.space weapon data  
**Confidence**: 100%

Every weapon has a warmup value (in seconds) representing the delay from combat round start until the weapon becomes ready to fire.

Example:
- Augur's Obliterator Torpedo has 2-second warmup
- This means it cannot fire until round 3 (if rounds are 1-second duration)

**Implication**: Warmup is fundamental to weapon timing, not a derived value.

### 2. Weapons Have Cooldown
**Evidence**: Direct observation from stfc.space weapon data  
**Confidence**: 100%

Every weapon has a cooldown value (in seconds) representing the delay after firing before the weapon can fire again.

Example:
- Augur's Obliterator Torpedo has 3-second cooldown
- After firing in round 3, it cannot fire again until round 6

**Implication**: Cooldown determines weapon firing frequency.

### 3. Weapons Have Shot Count
**Evidence**: Direct observation from stfc.space weapon data  
**Confidence**: 100%

Many weapons fire multiple shots during a single activation (one "burst").

Example:
- Augur's Beam Array has 2 shots
- When the weapon activates, it fires 2 shots in rapid succession
- The cooldown begins after both shots complete

**Implication**: Shot count represents consecutive shots during one weapon activation cycle, not separate activations.

### 4. Shot Count Represents Burst Fire
**Evidence**: Visual animation patterns in STFC  
**Confidence**: 95%

Multiple shots from a single weapon occur rapidly with small delays between them (typically 50-100ms in visualization), not as separate cooldown cycles.

**Implication**: A weapon with 2 shots and 3-second cooldown fires "shot1, delay, shot2, then cooldown", not "shot1, cooldown, shot2, cooldown".

### 5. Left/Right/Center Are Visualization Concepts
**Evidence**: stfc.space does not specify hardpoint positions  
**Confidence**: 100%

Weapon data in STFC does not include:
- hardpoint position (left/right/center)
- visual mounting point
- animation type

These are visualization layer concerns, not combat data.

**Implication**: 
- `ship-model` should not define hardpoint positions
- `visualization-model` should map weapons to hardpoints
- Same weapon could render differently on different ships

### 6. Ship Visualizer Is Not a Combat Simulator
**Evidence**: Project vision and milestone goals  
**Confidence**: 100%

This project visualizes weapon firing patterns, not combat outcomes.

We do NOT simulate:
- damage calculation
- shield mechanics
- target selection
- combat resolution
- defeat conditions

**Implication**: Combat model should generate events (weapon fired), not simulate damage/shields/health.

### 7. Firing Order May Be Derived from Weapon Array Position
**Evidence**: Weapon listing order on stfc.space appears consistent with firing order  
**Confidence**: 70% (needs verification)

When weapons have the same warmup, they appear to fire in the order they are listed in the ship's weapon array.

**Implication**: If confirmed, weapon order in `Ship.weapons[]` array determines firing priority.

---

## Likely True

### 1. Weapon Listing Order Represents Firing Order
**Confidence**: 70%  
**Evidence**: 
- stfc.space lists weapons in consistent order
- Observed firing patterns match listing order when warmups are equal
- No counter-examples found yet

**If False**:
- `combat-model` would need explicit weapon priority values
- Ship definitions would need `firingPriority` field
- Impact: Minor (single field addition)

**Affected Packages**:
- `ship-model`: Would add `firingPriority?: number` to WeaponDefinition
- `combat-model`: Would sort by priority instead of array position

### 2. Attacker Fires Before Defender in PvP
**Confidence**: 85%  
**Evidence**: 
- Common STFC community understanding
- Initiative mechanics typically favor attacker
- Aligns with "alpha strike" meta

**If False**:
- Would need ship role tracking (attacker/defender)
- Would affect multi-ship combat visualization
- Impact: Medium (requires role concept)

**Affected Packages**:
- `combat-model`: Would need combat context (attacker/defender roles)
- `visualization-model`: No change (receives events regardless)
- `ship-animator`: Would need multi-ship support anyway

### 3. Warmup/Cooldown/Shots Are More Fundamental Than FiringSchedule
**Confidence**: 90%  
**Evidence**:
- All STFC weapons have warmup/cooldown/shots in source data
- FiringSchedule was designed before discovering stfc.space data structure
- Current FiringSchedule types (EveryRound, Interval, SpecificRounds) appear to be derived patterns

**If False**:
- Some ships have truly irregular firing patterns not derivable from warmup/cooldown
- Would require manual FiringSchedule authoring
- Impact: High (current model is correct, no migration needed)

**Affected Packages**:
- `ship-model`: WeaponDefinition structure would change
- `combat-model`: Event generation logic would change from FiringSchedule interpretation to warmup/cooldown calculation
- `visualization-model`: No change (receives combat events)

### 4. Rounds Are 1-Second Duration
**Confidence**: 60%  
**Evidence**:
- Warmup/cooldown values align with round counts when assuming 1-second rounds
- No official documentation found
- Could be different in different game modes

**If False**:
- Would need round duration configuration
- Would affect time-to-visual transformation
- Impact: Low (configuration parameter)

**Affected Packages**:
- `combat-model`: Would accept `roundDuration` parameter
- `visualization-model`: Already works in milliseconds (no change)

---

## Open Questions

### 1. Does Weapon Listing Order Always Equal Firing Order?
**Research Needed**:
- Examine ships with many weapons (Borg Cube, Enterprise)
- Compare stfc.space listing order to observed firing patterns
- Look for counter-examples

**Impact if Answered**:
- If YES: Array position is sufficient
- If NO: Need explicit priority field

**Priority**: High (affects ship definition authoring)

### 2. Can Weapon Order Always Be Derived from Array Position?
**Research Needed**:
- Check if any ships have non-sequential firing despite warmup parity
- Look for ships with explicit firing order metadata

**Impact if Answered**:
- Determines whether `firingPriority` is needed
- Affects ship definition complexity

**Priority**: Medium (fallback is manual priority)

### 3. Are There Ships with Irregular Firing Patterns?
**Research Needed**:
- Find ships whose firing cannot be described by warmup/cooldown/shots
- Look for special weapons with unique timing

**Impact if Answered**:
- If YES: FiringSchedule abstraction may be necessary
- If NO: Can safely migrate to warmup/cooldown/shots

**Priority**: High (determines architecture direction)

### 4. What Additional Combat Concepts Matter for Visualization?
**Research Needed**:
- Identify combat mechanics that affect animations (e.g., critical hits, shield impacts)
- Determine which mechanics are purely simulation vs. visually observable

**Potential Concepts**:
- Critical hits (different visual effect?)
- Shield impacts vs. hull impacts
- Weapon charging animations
- Special abilities

**Impact if Answered**:
- Determines scope of visual event types
- Affects renderer complexity

**Priority**: Low (future milestone concern)

### 5. Do Different Game Modes Use Different Round Durations?
**Research Needed**:
- Compare PvP, PvE, and Armada combat timing
- Check for official round duration documentation

**Impact if Answered**:
- Determines if round duration should be configurable
- Affects documentation accuracy

**Priority**: Low (1-second assumption works for prototyping)

### 6. How Do Multi-Ship Combats Sequence Firing?
**Research Needed**:
- Observe 3v3 battles
- Determine target selection rules (for visual purposes only)
- Identify round interleaving vs. sequential firing

**Impact if Answered**:
- Affects multi-ship visualization architecture
- Determines event generation complexity

**Priority**: Low (future milestone)

---

## Architectural Implications

### Current Architecture Strengths
1. **Layer separation works**: Combat → Visualization → Rendering is clean
2. **Framework independence proven**: Domain packages have no UI dependencies
3. **Event-based interface scales**: VisualEvent abstraction handles any combat complexity

### Potential Architecture Improvements

#### 1. Migrate WeaponDefinition to Warmup/Cooldown/Shots
**Rationale**: 
- Matches STFC source data structure
- More maintainable (copy values from stfc.space)
- FiringSchedule becomes derived, not authored

**Impact**:
- `ship-model`: Change WeaponDefinition fields
- `combat-model`: Rewrite event generation logic
- `visualization-model`: No change
- `ship-animator`: No change

**Risk**: Low (internal refactor, no API changes to visualization layer)

**Recommendation**: Investigate in firing-pattern-analysis.md

#### 2. Separate Hardpoint Definitions from Ship Model
**Rationale**:
- Hardpoints are visualization concepts, not combat data
- Enables visual customization without changing ship definitions

**Current State**: Already separated (augurHardpoints in visualization-model examples)

**Recommendation**: Current approach is correct, document as best practice

#### 3. Add Weapon Priority Field (If Order ≠ Array Position)
**Rationale**: 
- Explicit is better than implicit if firing order matters
- Prevents bugs from accidental reordering

**Risk**: Low (additive change)

**Recommendation**: Wait for research findings (Task 3)

### Architecture Decisions to Preserve

1. **Keep combat-model simulation-free**: Do NOT add damage/health/shields
2. **Keep renderer combat-ignorant**: Renderer only understands VisualEvents
3. **Keep domain packages framework-agnostic**: No React/Vue/etc. in domain code

### Documentation Strategy

**Before any refactor of combat, ship, or visualization models**:
1. Read `docs/domain-notes.md` for current understanding
2. Update domain notes with new discoveries
3. Verify architectural implications
4. Ensure changes preserve layer separation

**Domain understanding drives architecture, not the reverse.**

---

## Change Log

**May 30, 2026**: Initial domain notes created after completing Ship Animator v0. Documented warmup/cooldown/shots discoveries, identified FiringSchedule as potentially derived concept, listed open questions for research.
