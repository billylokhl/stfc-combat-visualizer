# STFC Domain Notes

**Purpose**: Capture combat domain knowledge, discoveries, assumptions, and open questions to guide architectural decisions.

**Last Updated**: May 30, 2026 (Milestone 6: Migration to warmup/cooldown/shots)

---

## Confirmed Facts

### 1. Warmup/Cooldown/Shots Is Now Canonical Model ✅ IMPLEMENTED
**Evidence**: Direct observation from stfc.space weapon data
**Verification Method**: Manual inspection of multiple ships on stfc.space
**Status**: ✅ Confirmed and Implemented (Milestone 6)

Every weapon in STFC has three timing values:
- **Warmup** (rounds): Delay before first fire
- **Cooldown** (rounds): Delay between fires
- **Shots** (count): Number of projectiles per activation

Example from stfc.space (converted to rounds):
- Augur's Obliterator Torpedo: warmup=1, cooldown=3, shots=1
- Augur's Beam Array: warmup=0, cooldown=1, shots=2

**Implementation**:
- WeaponDefinition now uses warmup/cooldown/shots fields (packages/ship-model)
- Combat event generation derives firing from warmup/cooldown (packages/combat-model)
- Firing schedules are now derived behavior, not authored data

**Implication**: These values exist in STFC game data and serve as the source of truth for weapon timing.

### 2. Hardpoint Positions Not in Source Data
**Evidence**: stfc.space does not specify hardpoint positions (left/right/center)
**Verification Method**: Manual inspection of weapon data fields
**Status**: ✅ Confirmed

Weapon data does NOT include:
- hardpoint position (left/right/center)
- visual mounting point
- animation type

**Implication**: Hardpoint positions are visualization decisions, not combat data. Same weapon can render differently on different ships.

### 3. Project Scope: Visualization, Not Simulation
**Evidence**: Project vision and milestone goals
**Verification Method**: Repository documentation
**Status**: ✅ Confirmed

This project visualizes weapon firing patterns. We do NOT simulate:
- damage calculation
- shield mechanics
- target selection
- combat resolution
- health/defeat

**Implication**: Combat model generates events (weapon fired), not outcomes (damage dealt).

---

## Strong Evidence (High Confidence Hypotheses)

### 1. Warmup/Cooldown/Shots Determine Firing Pattern ✅ VALIDATED
**Evidence**: 5 analyzed ships (Augur, Vengeance, Kelvin, Borg Cube, Rotarran) all derivable
**Confidence**: 95% (increased after implementation validation)
**Verification Method**: Firing pattern analysis + Milestone 6 implementation
**Status**: ✅ Validated (implemented and tested)

**Claim**: Weapon firing patterns can be mechanically derived from warmup/cooldown/shots values without manual schedule authoring.

**Evidence**:
- 5/5 ships analyzed had derivable patterns
- No irregular timing discovered
- All patterns match expected warmup+cooldown behavior
- ✅ Augur firing pattern preserved after migration (verified via npm run demo:augur)
- ✅ Visualization layer unchanged (verified via npm run demo:visual)

**Algorithm Implemented** (packages/combat-model/src/index.ts):
```typescript
firstRound = 1 + warmup
weaponFires = (round === firstRound) || ((round - firstRound) % cooldown === 0)
```

**Validation Remaining**: Compare derived patterns to actual battle logs.

### 2. Shot Count Represents Burst Fire
**Evidence**: Typical STFC weapon behavior shows rapid consecutive shots
**Confidence**: 85%
**Verification Method**: Observation of STFC combat animations
**Status**: 🔬 Hypothesis (needs timing measurement)

**Claim**: A weapon with shots=2 fires both shots rapidly during one activation, then cooldown begins.

**Alternative Hypothesis**: Each shot triggers a separate cooldown cycle.

**Evidence**:
- Visual animations show rapid bursts
- Logical interpretation of "shots per activation"

**If False**: Event generation timing model needs revision.

**Validation Needed**: Measure inter-shot delays in actual combat.

---

## Likely True

### 1. Weapon Listing Order Represents Firing Order
---

## Unverified Hypotheses (Medium Confidence)

### 1. Weapon Listing Order Determines Firing Order
**Evidence**: stfc.space weapon order appears consistent with observed firing
**Confidence**: 70%
**Verification Method**: Visual observation, no battle-log data
**Status**: 🔬 Hypothesis (needs controlled testing)

**Claim**: When multiple weapons have the same warmup, they fire in the order listed in the weapon array.

**Evidence**:
- stfc.space lists weapons in consistent order
- No counter-examples found in 5 analyzed ships
- Appears logical for implementation
**Evidence**: STFC community knowledge, initiative mechanics
**Confidence**: 60%
**Verification Method**: Community discussion, no official documentation
**Status**: 🔬 Hypothesis (needs PvP battle-log analysis)

**Claim**: In PvP combat, the attacking ship enters firing sequence before the defending ship.

**Evidence**:
- Common STFC community understanding
- Initiative mechanics typically favor attacker
- Aligns with "alpha strike" meta

**If False**:
- Would need combat context (attacker/defender roles)
- Would affect multi-ship visualization
- Impact: Medium (requires role concept)

**Affected Packages**: combat-model (would need role tracking)

**Validation Needed**: PvP battle logs showing firing sequence

### 3. Round Duration Is Constant at 1 Second
**Evidence**: Warmup/cooldown values appear to align with 1-second rounds
**Confidence**: 50%
**Verification Method**: Assumption based on value alignment
**Status**: ❓ Unknown (needs timing measurement)

**Claim**: STFC combat rounds are exactly 1 second in duration.

**Evidence**:
- Warmup/cooldown values (integers) align with round counts
- No official documentation found

**If False**:
- Would need round duration configuration
- Would affect time calculations
- Impact: Low (configuration parameter)

**Affected Packages**: combat-model

**Validation Needed**: Video analysis of combat timing, frame counting

---

## Unknowns (Low Confidence / No Evidence)

### 1. Special Abilities and Weapon Modifiers
**Status**: ❓ Unknown

No research yet on:
- Officer abilities that modify weapon timing
- Ship abilities that affect firing patterns
- Critical hits and special effects
- Morale/crew effects on combat

**Impact**: May affect event generation if abilities modify warmup/cooldown dynamically.

### 2. Multi-Ship Combat Sequencing
**Status**: ❓ Unknown
Future Validation Targets

### High Priority (Affects Current Architecture)

**1. Weapon Firing Order**
- **Question**: Does weapon array position always determine firing order?
- **Method**: Analyze ships with 4+ weapons with identical warmup values
- **Ships to Test**: Borg Cube (6 weapons), Enterprise, Voyager
- **Success Criteria**: 10+ ships with no counter-examples

**2. Warmup/Cooldown Derivability**
- **Question**: Are all firing patterns derivable from warmup/cooldown/shots?
- **Method**: Search for irregular schedules in ship database
- **Ships to Test**: Special event ships, faction-specific ships, legendary ships
- **Success Criteria**: 20+ ships analyzed, no irregular patterns found

**3. Round Duration**
- **Question**: Is round duration exactly 1 second?
- **Method**: Video analysis of combat with frame counting
- **Ships to Test**: Any ship, multiple game modes
- **Success Criteria**: Measured duration ±0.1s across 10+ battles

### Medium Priority (Future Features)

**4. Attacker/Defender Sequencing**
- **Question**: Does attacker always fire before defender in PvP?
- **Method**: PvP battle log analysis
- **Ships to Test**: Mirror matches (same ship vs. same ship)
- **Success Criteria**: 20+ PvP battles showing consistent ordering

**5. Multi-Shot Timing**
- **Question**: What is the delay between shots in a burst?
- **Method**: Frame-by-frame video analysis
- **Ships to Test**: Augur (2-shot weapons), Vengeance (3-shot weapons)
- **Success Criteria**: Measured inter-shot delay ±10ms

### Low Priority (Edge Cases)

**6. Unusual Firing Schedules**
- **Question**: Are there weapons with non-standard timing?
- **Method**: Database search for special abilities
- **Ships to Test**: Event ships, limited-time ships, faction flagships
- **Success Criteria**: Catalog of any irregular patterns found

**7. Officer and Ability Effects**
- **Question**: Do officer abilities modify weapon timing?
- **Method**: Community documentation research
- **Ships to Test**: Ships with known timing-modifying officers
- **Success Criteria**: Document which effects matter for visualization vs. simulation

---

##
No research on:
- 3v3 battle firing order
- Target selection
- Focus fire mechanics
- Round interleaving vs. sequential

**Impact**: Future milestone concern (multi-ship visualization).

### 3. Game Mode Timing Variations
**Status**: ❓ Unknown

No research on whether round duration varies across:
- PvP
- PvE
- Armada battles
- Territory capture

**Impact**: May require mode-specific configuration.**If False**:
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
