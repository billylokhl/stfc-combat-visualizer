# Combat Assumptions Register

**Purpose**: Central registry of assumptions that may affect architecture decisions.

**Last Updated**: May 30, 2026

---

## How to Use This Register

Before modifying domain models (ship-model, combat-model, visualization-model):
1. Check if the change relates to any assumption listed here
2. Review the assumption's confidence level and validation status
3. If confidence is low (<80%), consider validating before proceeding
4. Update the assumption status when new evidence is found

---

## Assumptions

### ASSUMPTION-001: Warmup/Cooldown/Shots Fully Determine Firing Pattern

**ID**: ASSUMPTION-001
**Category**: Combat Mechanics
**Confidence**: 90%
**Status**: 🔬 Hypothesis (unverified)

**Description**:
All weapon firing patterns in STFC can be mechanically derived from three values:
- Warmup (round number when weapon first fires)
- Cooldown (rounds between subsequent fires)
- Shots (projectiles per activation)

**Warmup Semantics**: warmup=N means first activation in round N (not N rounds of delay).

No manual schedule authoring is required.

**Evidence**:
- 5/5 analyzed ships (Augur, Vengeance, Kelvin, Borg Cube, Rotarran) have derivable patterns
- No irregular timing discovered in analyzed ships
- Theoretical algorithm generates expected patterns

**Evidence Gaps**:
- No actual battle-log validation performed
- Only 5 ships analyzed out of 100+ in game
- No special event ships examined
- No legendary/faction flagship ships examined

**Impact if False**:
- HIGH: Would invalidate proposed migration from FiringSchedule to warmup/cooldown/shots
- Some ships would require manual FiringSchedule authoring
- Hybrid model needed (warmup/cooldown for most, manual for edge cases)

**Affected Packages**:
- `ship-model`: WeaponDefinition structure
- `combat-model`: Event generation algorithm

**Validation Method**:
1. Extract warmup/cooldown/shots from stfc.space for 20+ ships
2. Derive firing patterns using algorithm
3. Compare to actual battle logs (screenshot analysis or player reports)
4. Document any ships with irregular patterns

**Validation Tools**:
- packages/domain-validation (comparison framework)
- demos/domain-validation.ts (validation report generator)

**Blockers**:
- Need battle-log data source (screenshots, player reports, or API access)
- Need methodology for extracting firing sequence from logs

---

### ASSUMPTION-002: Weapon Listing Order Equals Firing Order

**ID**: ASSUMPTION-002
**Category**: Combat Mechanics
**Confidence**: 70%
**Status**: 🔬 Hypothesis (unverified)

**Description**:
When multiple weapons have the same warmup value, they fire in the order they appear in the ship's weapon array (as listed on stfc.space).

**Evidence**:
- stfc.space lists weapons in consistent order
- No counter-examples found in 5 analyzed ships
- Logical for implementation (natural array iteration order)

**Evidence Gaps**:
- No controlled testing with same-warmup weapons
- No battle-log confirmation
- Assumption based on listing order appearing "sensible"

**Impact if False**:
- MEDIUM: Would need explicit `firingPriority` field in WeaponDefinition
- Combat model would need to sort weapons by priority instead of array position
- Ship authoring becomes slightly more complex

**Affected Packages**:
- `ship-model`: WeaponDefinition (would add optional `firingPriority?: number`)
- `combat-model`: Event generation (would sort by priority)

**Validation Method**:
1. Find ships with 3+ weapons having identical warmup
2. Analyze battle logs to determine actual firing sequence
3. Compare to array position order
4. Test with 10+ ships

**Validation Tools**:
- packages/domain-validation (sequence comparison)

**Blockers**:
- Need ships with same-warmup weapons
- Need battle-log data

**Mitigation**:
If false, adding `firingPriority` field is low-impact (optional field, defaults to array position).

---

### ASSUMPTION-003: Round Duration Is Constant at 1 Second

**ID**: ASSUMPTION-003
**Category**: Combat Timing
**Confidence**: 50%
**Status**: ❓ Unknown (no evidence)

**Description**:
STFC combat rounds are exactly 1 second in duration, across all game modes (PvP, PvE, Armada).

**Evidence**:
- Warmup/cooldown values (integers) align well with 1-second rounds
- No official documentation found

**Evidence Gaps**:
- No timing measurements performed
- No video analysis with frame counting
- No comparison across game modes

**Impact if False**:
- LOW: Would need round duration configuration parameter
- Would affect time calculations in combat-model
- Visualization already works in milliseconds (no change)

**Affected Packages**:
- `combat-model`: Would accept `roundDuration` parameter (default: 1000ms)

**Validation Method**:
1. Record STFC combat videos (60fps)
2. Frame-count round durations
3. Compare across game modes (PvP, PvE, Armada)
4. Measure 20+ rounds for statistical confidence

**Validation Tools**:
- Video editing software (frame stepping)
- Manual timing analysis

**Blockers**:
- Need high-quality combat footage
- Need access to multiple game modes

**Mitigation**:
If false, adding configurable round duration is trivial (single parameter).

---

### ASSUMPTION-004: Attacker Fires Before Defender in PvP

**ID**: ASSUMPTION-004
**Category**: Combat Sequencing
**Confidence**: 60%
**Status**: 🔬 Hypothesis (community knowledge)

**Description**:
In PvP combat, the attacking ship (initiator) enters the firing sequence before the defending ship (target).

**Evidence**:
- Common STFC community understanding
- Initiative mechanics in similar games favor attacker
- Aligns with "alpha strike" meta

**Evidence Gaps**:
- No battle-log analysis performed
- No official documentation
- Based on community consensus, not measurement

**Impact if False**:
- MEDIUM: Would need combat context (attacker/defender roles) in event generation
- Would affect multi-ship visualization
- Currently out of scope (single-ship visualization only)

**Affected Packages**:
- `combat-model`: Would need role tracking for multi-ship scenarios
- `visualization-model`: No change (receives events)

**Validation Method**:
1. Analyze PvP battle logs (mirror matches: same ship vs. same ship)
2. Identify which ship fires first
3. Test with 20+ PvP battles
4. Compare across different ship classes

**Validation Tools**:
- packages/domain-validation (multi-ship sequence comparison)

**Blockers**:
- Need PvP battle-log data
- Out of scope for current milestone (single-ship only)

**Mitigation**:
If false, would require role context in combat generation. Not urgent (multi-ship is future milestone).

---

### ASSUMPTION-005: Hardpoint Positions Are Visualization-Only

**ID**: ASSUMPTION-005
**Category**: Architecture
**Confidence**: 100%
**Status**: ✅ Confirmed

**Description**:
Hardpoint positions (left/right/center) are presentation-layer decisions, not combat data. The same weapon could be visualized differently on different ships.

**Evidence**:
- stfc.space does not include hardpoint position data
- Manual inspection of weapon data fields confirms absence
- No combat mechanics depend on visual position

**Evidence Gaps**:
- None (negative evidence: absence of data)

**Impact if False**:
- N/A (confirmed)

**Affected Packages**:
- `ship-model`: Should NOT include hardpoint positions
- `visualization-model`: SHOULD include hardpoint mapping
- `ship-animator`: Uses visualization-model hardpoints

**Validation Method**:
- Already validated (manual inspection)

**Validation Tools**:
- N/A

**Blockers**:
- None

---

### ASSUMPTION-006: Shot Count Represents Burst Fire

**ID**: ASSUMPTION-006
**Category**: Combat Timing
**Confidence**: 85%
**Status**: 🔬 Hypothesis (visual observation)

**Description**:
A weapon with `shots=2` fires both shots rapidly during one activation (burst fire), then cooldown begins. Shots are NOT separated by cooldown cycles.

**Alternative Hypothesis**:
Each shot triggers a separate cooldown cycle (shots=2 means "fires every cooldown/2").

**Evidence**:
- STFC visual animations show rapid bursts
- Logical interpretation of "shots per activation"
- Matches typical game combat patterns

**Evidence Gaps**:
- No timing measurements of inter-shot delay
- No official documentation
- Based on visual observation, not data

**Impact if False**:
- HIGH: Event generation timing model would be wrong
- Visualization timing would be incorrect
- Would need to revise shot sequencing in combat-model

**Affected Packages**:
- `combat-model`: Shot generation logic
- `visualization-model`: Shot timing within rounds

**Validation Method**:
1. Record combat videos (60fps) of multi-shot weapons
2. Frame-count delays between shots in a burst
3. Measure inter-shot delay vs. cooldown duration
4. Test with 10+ weapons with shots > 1

**Validation Tools**:
- Video analysis (frame stepping)
- Timing measurement

**Blockers**:
- Need high-quality combat footage
- Need ships with multi-shot weapons

**Mitigation**:
If false, would need to revise event generation. Moderate impact (affects timing, not architecture).

---

### ASSUMPTION-007: Project Scope Excludes Combat Simulation

**ID**: ASSUMPTION-007
**Category**: Architecture
**Confidence**: 100%
**Status**: ✅ Confirmed (project decision)

**Description**:
This project visualizes weapon firing patterns. We do NOT simulate combat outcomes (damage, shields, health, defeat).

**Evidence**:
- Project vision documentation
- Milestone goals focus on visualization
- Explicit scope boundaries

**Evidence Gaps**:
- None (design decision)

**Impact if False**:
- N/A (this is a project scope decision, not a STFC mechanics assumption)

**Affected Packages**:
- `combat-model`: Generates events, not outcomes
- `visualization-model`: Receives events, not damage values
- `ship-animator`: Renders firing, not health bars

**Validation Method**:
- N/A (scope decision)

**Validation Tools**:
- N/A

**Blockers**:
- None

---

## Summary Statistics

**Total Assumptions**: 7

**By Confidence Level**:
- High (100%): 2 (confirmed)
- Medium (70-90%): 3 (strong hypotheses)
- Low (<70%): 2 (weak hypotheses)

**By Validation Status**:
- ✅ Confirmed: 2
- 🔬 Hypothesis (needs validation): 4
- ❓ Unknown (no evidence): 1

**By Impact if False**:
- HIGH: 2 (ASSUMPTION-001, ASSUMPTION-006)
- MEDIUM: 2 (ASSUMPTION-002, ASSUMPTION-004)
- LOW: 1 (ASSUMPTION-003)
- N/A: 2 (confirmed assumptions)

---

## Validation Priorities

Based on confidence and impact:

**Priority 1 (High Impact, Low Confidence)**:
- ASSUMPTION-006: Shot count timing model (85% confidence, HIGH impact)

**Priority 2 (High Impact, Medium Confidence)**:
- ASSUMPTION-001: Warmup/cooldown derivability (90% confidence, HIGH impact)

**Priority 3 (Medium Impact, Low Confidence)**:
- ASSUMPTION-002: Weapon firing order (70% confidence, MEDIUM impact)

**Priority 4 (Low Impact or Future Concern)**:
- ASSUMPTION-003: Round duration (50% confidence, LOW impact)
- ASSUMPTION-004: Attacker/defender sequencing (60% confidence, out of scope)

---

## Change Log

**May 30, 2026**: Initial assumptions register created. Documented 7 assumptions covering combat mechanics, timing, and architecture decisions. Prioritized validation needs based on impact and confidence levels.
