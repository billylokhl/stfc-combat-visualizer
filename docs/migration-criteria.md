# Migration Criteria: FiringSchedule → Warmup/Cooldown/Shots

**⚠️ OBSOLETE DOCUMENT ⚠️**

**Status**: Migration completed in Milestone 6 (May 30, 2026)
**Retained for**: Historical reference only

This document tracked the decision criteria for migrating from FiringSchedule to warmup/cooldown/shots.
**The migration has been completed.** See [docs/domain-notes.md](domain-notes.md) for current architecture.

---

## Historical Context

**Original Purpose**: Define objective criteria for when to migrate from FiringSchedule to warmup/cooldown/shots model.

**Original Status**: Migration deferred pending validation

**Outcome**: Migration proceeded in Milestone 6 based on:
- Sufficient evidence from 5 analyzed ships
- Validation infrastructure in place (domain-validation package)
- Successful Augur firing pattern preservation

**Current Architecture** (as of May 31, 2026):
- ✅ WeaponDefinition uses warmup/cooldown/shots fields
- ✅ FiringSchedule union type removed
- ✅ Combat events derived from warmup/cooldown algorithm
- ✅ Domain realignment completed (warmup semantics corrected)

---

## Original Migration Criteria (Archived)

---

## Why Migration is Deferred

### Insufficient Evidence

**Current Evidence**:
- ✅ Warmup/cooldown/shots values exist in STFC game data (stfc.space)
- ✅ Theoretical analysis shows 5/5 ships are derivable from warmup/cooldown/shots
- ❌ **No battle-log validation performed**
- ❌ **Only 5 ships analyzed out of 100+ in game**
- ❌ **No special event or legendary ships examined**

**Risk**: Changing architecture based on theory could be invalidated by real-world data.

### Unknowns That Could Invalidate Migration

**High-Risk Unknowns**:
1. **Irregular firing patterns**: Some ships may have non-standard timing not expressible via warmup/cooldown
2. **Officer ability effects**: Abilities may modify weapon timing dynamically
3. **Special weapons**: Event ships or faction flagships may use different models
4. **Round duration variance**: If rounds aren't 1-second, derivation logic may be wrong

**Medium-Risk Unknowns**:
1. **Weapon ordering**: Array position may not determine firing order
2. **Multi-shot timing**: Inter-shot delays may not match current model

### Premature Migration Risks

**If we migrate now and assumptions are false**:
- ❌ Would need to revert or create hybrid model
- ❌ Would lose time on re-architecture
- ❌ Would need to migrate existing ships back
- ❌ Would undermine confidence in future architectural decisions

**If we defer migration until validated**:
- ✅ Current FiringSchedule model works (Ship Animator v0 proves this)
- ✅ Can make informed decision based on evidence
- ✅ Migration will be safer with more ship examples
- ✅ Validation infrastructure is now in place (packages/domain-validation)

---

## Migration Criteria

**Migrate from FiringSchedule to warmup/cooldown/shots when ALL of the following are met:**

### Criterion 1: High-Confidence Derivability
**Requirement**: ASSUMPTION-001 (warmup/cooldown derivability) reaches ≥90% confidence

**Validation Method**:
- Analyze at least **20 ships** from diverse categories:
  - 5 explorers
  - 5 battleships
  - 5 interceptors
  - 3 faction flagships
  - 2 special event ships
- Extract warmup/cooldown/shots from stfc.space
- Derive firing patterns using algorithm
- **Compare to actual battle logs** (screenshots or video analysis)
- Document any ships with irregular patterns

**Success Threshold**: ≥95% of analyzed ships (19/20) have derivable patterns

**Current Status**: ❌ 0% (no battle-log validation performed yet)

---

### Criterion 2: Weapon Ordering Confirmed
**Requirement**: ASSUMPTION-002 (weapon listing order) reaches ≥85% confidence

**Validation Method**:
- Find at least **10 ships** with 3+ weapons having identical warmup values
- Analyze battle logs to determine actual firing sequence
- Compare to array position order
- Document any counter-examples

**Success Threshold**: ≥90% of tested ships (9/10) fire in array order

**Alternative**: If criterion fails, add optional `firingPriority` field before migration

**Current Status**: ❌ 0% (no same-warmup testing performed)

---

### Criterion 3: Round Duration Validated
**Requirement**: ASSUMPTION-003 (round duration) reaches ≥80% confidence

**Validation Method**:
- Record STFC combat videos at 60fps
- Frame-count at least **20 rounds** across multiple battles
- Measure round duration in milliseconds
- Compare across game modes (PvP, PvE, Armada)

**Success Threshold**: Round duration = 1000ms ±50ms (95% of measurements)

**Alternative**: If criterion fails, add configurable `roundDuration` parameter before migration

**Current Status**: ❌ 0% (no timing measurements performed)

---

### Criterion 4: No High-Impact Contradictions
**Requirement**: No discovered evidence contradicting high-impact assumptions

**Validation Method**:
- Review all ships analyzed for irregular patterns
- Check for officer abilities that modify weapon timing
- Examine special weapons with unique mechanics
- Document all edge cases

**Success Threshold**: Zero high-impact contradictions found

**High-Impact Contradictions**:
- Ships with firing patterns not expressible via warmup/cooldown/shots
- Weapons with dynamic timing (changes mid-combat)
- Critical game mechanics not accounted for in model

**Current Status**: ✅ 0 contradictions found (but only 5 ships analyzed)

---

### Criterion 5: Validation Infrastructure Ready
**Requirement**: Tools exist to validate migration correctness

**Validation Method**:
- `packages/domain-validation` package complete
- Comparison framework tested
- At least 10 ship examples with expected patterns
- Demo script generates useful reports

**Success Threshold**: Infrastructure proven with example ships

**Current Status**: ✅ Complete (Milestone 5)

---

### Criterion 6: Ship Animator Unaffected
**Requirement**: Migration preserves existing functionality

**Validation Method**:
- Run Ship Animator v0 before migration
- Perform migration in feature branch
- Run Ship Animator v0 after migration
- Compare visual output frame-by-frame

**Success Threshold**: Zero visual differences in rendered output

**Current Status**: ⏸️ Ready to test when migration occurs

---

## Migration Decision Matrix

| Criterion | Weight | Current Status | Required for Migration |
|-----------|--------|----------------|----------------------|
| 1. Derivability (≥90% confidence) | HIGH | ❌ 0% | YES |
| 2. Weapon Ordering (≥85% confidence) | MEDIUM | ❌ 0% | YES (or fallback) |
| 3. Round Duration (≥80% confidence) | LOW | ❌ 0% | YES (or fallback) |
| 4. No Contradictions | HIGH | ✅ Pass | YES |
| 5. Infrastructure Ready | MEDIUM | ✅ Pass | YES |
| 6. Ship Animator Unaffected | HIGH | ⏸️ Ready | YES |

**Current Migration Readiness**: **3/6 criteria met** (50%)

**Blocking Criteria**: 1, 2, 3 (need battle-log validation)

---

## Migration Timeline Scenarios

### Scenario A: Rapid Validation (Best Case)
**Timeline**: 2-4 weeks

**Path**:
1. Week 1: Collect battle-log data (screenshots/video) for 10 ships
2. Week 2: Analyze patterns, populate observed data in domain-validation
3. Week 3: Run validation reports, assess results
4. Week 4: If criteria met, perform migration

**Likelihood**: 40% (depends on battle-log data availability)

---

### Scenario B: Gradual Validation (Expected Case)
**Timeline**: 2-3 months

**Path**:
1. Month 1: Collect data for 5 ships, validate incrementally
2. Month 2: Collect data for 10 more ships, identify patterns
3. Month 3: Collect data for final 5 ships, make decision

**Likelihood**: 50% (realistic given data collection effort)

---

### Scenario C: Extended Validation (Conservative Case)
**Timeline**: 6+ months

**Path**:
1. Months 1-3: Collect data opportunistically (10 ships)
2. Months 4-6: Analyze edge cases, special ships (10 more ships)
3. Month 6+: Make decision based on comprehensive evidence

**Likelihood**: 10% (if battle-log data is hard to obtain)

---

### Scenario D: Never Migrate
**Timeline**: Indefinite

**Triggers**:
- Significant contradictions discovered (multiple ships with irregular patterns)
- Battle-log data proves inaccessible
- FiringSchedule model proves sufficient for all ships

**Likelihood**: 5% (evidence so far suggests migration is beneficial)

---

## What Happens If We Never Migrate?

**Architecture Impact**: Minimal

**Current FiringSchedule model is functional**:
- ✅ Ship Animator v0 works correctly
- ✅ Can express all analyzed ship patterns
- ✅ No known bugs or limitations

**Trade-offs**:
- ⚠️ Ship authoring is less maintainable (manual FiringSchedule translation)
- ⚠️ Doesn't match STFC source data structure
- ⚠️ Higher cognitive load for adding new ships
- ✅ No migration risk
- ✅ No refactoring effort

**Conclusion**: Never migrating is **viable but suboptimal**. Current model works, but migration would improve maintainability if assumptions validate.

---

## Recommended Action Plan

### Phase 1: Data Collection (Current)
1. ✅ Create validation infrastructure (packages/domain-validation) - **DONE**
2. ✅ Document assumptions and criteria - **DONE**
3. ⏸️ Collect battle-log data for 5 ships (screenshots or video)
4. ⏸️ Populate observed patterns in domain-validation examples

### Phase 2: Initial Validation (Next)
1. Run `npm run demo:validation` with real data
2. Assess results for 5 ships
3. Identify any contradictions or edge cases
4. Update assumptions register with findings

### Phase 3: Expanded Validation
1. Collect data for 10 more ships
2. Focus on ships with many weapons (Borg Cube, etc.)
3. Test special event ships if available
4. Document all irregular patterns found

### Phase 4: Migration Decision
1. Review all 6 criteria
2. If all met: Proceed with migration
3. If some met: Create hybrid model or add fallback fields
4. If few met: Defer migration and continue with FiringSchedule

### Phase 5: Migration Execution (If Approved)
1. Create feature branch `refactor/warmup-cooldown-model`
2. Update ship-model WeaponDefinition
3. Update combat-model event generation
4. Migrate all ships (currently just Augur)
5. Run Ship Animator v0 validation
6. Commit and document

---

## Blockers to Migration

**Critical Blockers** (must resolve):
1. **No battle-log data source** - Need screenshots, videos, or API access
2. **No validation methodology** - Need process for extracting firing sequences
3. **Insufficient ship coverage** - Only 5 ships analyzed

**Non-Critical Blockers** (can work around):
1. Round duration uncertainty - Can add configuration parameter
2. Weapon ordering uncertainty - Can add optional priority field
3. Inter-shot timing uncertainty - Already using assumptions in visualization

---

## Success Metrics

Migration is successful if:
- ✅ All 6 criteria met before migration
- ✅ Ship Animator v0 renders identically after migration
- ✅ All analyzed ships continue to work correctly
- ✅ New ships are easier to author (reduced cognitive load)
- ✅ Architecture better matches STFC domain

Migration should be reverted if:
- ❌ Ship Animator v0 visual output changes
- ❌ Any ship fails to render correctly
- ❌ New edge cases discovered that contradict model

---

## Conclusion

**Migration is theoretically sound but empirically unvalidated.**

Current recommendation: **DEFER migration** until:
1. Battle-log validation performed for ≥20 ships
2. All 6 criteria met
3. Confidence reaches ≥90% for high-impact assumptions

**Validation infrastructure is ready. Waiting for real-world evidence.**

See:
- `docs/combat-assumptions.md` for assumption registry
- `docs/domain-notes.md` for current domain knowledge
- `packages/domain-validation` for validation framework
- `npm run demo:validation` for validation reports

---

## Change Log

**May 30, 2026**: Initial migration criteria document created. Defined 6 objective criteria for migration decision. Current readiness: 50% (3/6 criteria met). Recommendation: DEFER pending battle-log validation.
