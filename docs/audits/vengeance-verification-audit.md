# Independent Audit: Vengeance Verification Report

**Audit Date**: May 31, 2026 (Milestone 12A)
**Subject Report**: docs/verification-reports/vengeance-verification.md
**Auditor Role**: Independent auditor — conclusions not assumed correct
**Methodology**: Systematic evidence traceability audit; each claim traced to its cited source

---

## 1. Executive Summary

The Vengeance verification report (M12) is **factually incomplete and contains internal inconsistencies**. The core recommendation to maintain `unverified` status is correct and policy-compliant. However, several significant deficiencies undermine the report's reliability as an evidence assessment.

**Primary Deficiencies:**

1. **Missed discrepancy** — Quantum Torpedo first-fire round differs between sources but was classified as "Fully Consistent"
2. **Circular reasoning** — Domain-validation and firing-pattern-analysis are treated as independent corroborating sources but domain-validation explicitly derives from firing-pattern-analysis
3. **Internal inconsistency** — Photon Torpedo warmup=1 is classified "Unknown" in one section and "Supported" in another
4. **Opaque confidence methodology** — Confidence percentages (65%, 88%, 70%) are not reproducibly derived; two inconsistent percentages appear in the same section
5. **Overstated evidence quality** — Weapon existence described as "validated as real STFC weapon" despite cited source explicitly stating values are hypothetical

**Audit Verdict: PASS WITH CONCERNS**

The `unverified` recommendation is correct. The report accurately identified the Photon cooldown discrepancy. However, the report's positive confidence ratings for Phaser/Pulse/Quantum rest on circular evidence, and a second discrepancy (Quantum first-fire round) was missed.

---

## 2. Evidence Traceability Findings

All factual claims from the report are traced to their cited sources below.

### 2.1 Claim: "Weapon Existence: Supported — Listed in firing-pattern-analysis.md; validated as real STFC weapon"

| Audit Step | Result |
|------------|--------|
| Does firing-pattern-analysis.md list Photon, Phaser, Pulse, Quantum? | ✅ Yes |
| Does firing-pattern-analysis.md validate these as real STFC weapons? | ❌ No |
| What does it say about its own evidence quality? | **"This analysis is based on HYPOTHETICAL warmup/cooldown/shots values, NOT actual battle logs"** and **"Validation Status: ❌ Unverified"** |

**Audit Finding**: The phrase "validated as real STFC weapon" is **overstated**. Firing-pattern-analysis explicitly disclaims its own authority. Listing a weapon in a hypothetical analysis does not validate its existence in the game. The claim should read: "Listed in hypothetical analysis (not validated against STFC source data)."

---

### 2.2 Claim: "Photon warmup=1: Status = Unknown (section 4) / Status = Supported (summary table)"

| Source | Photon Warmup Value |
|--------|---------------------|
| combat-model/vengeance.ts | warmup=1 |
| domain-validation/vengeance.ts | warmup=1 |
| firing-pattern-analysis.md (table) | 0s |

**Audit Finding**: The report assigns "Unknown" in the Section 4 weapon assessment table, but "Supported" in the Section summary table. These are **directly contradictory**. Only one classification can be correct, and neither was justified with a methodology for resolving the scale difference (0s vs 1 — see Section 3 below).

---

### 2.3 Claim: "Phaser Bank: Fully Consistent across domain-validation and firing-pattern-analysis"

| Source | Warmup | Cooldown | Shots |
|--------|--------|----------|-------|
| combat-model | 1 | 1 | 3 |
| domain-validation | 1 | 1 | 3 |
| firing-pattern-analysis (table) | 0s | 1s | 3 |
| firing-pattern-analysis (FiringSchedule) | firesEveryRound | — | 3 |

**Audit Finding**: Values are functionally equivalent (0s delay → fires round 1 = warmup=1 → fires round 1), but the report does not acknowledge the warmup notation difference. The "consistent" verdict is reasonable but relies on an implicit scale translation that is nowhere documented.

---

### 2.4 Claim: "Pulse Phaser: Fully Consistent across all sources"

| Source | Warmup | Cooldown | Shots |
|--------|--------|----------|-------|
| combat-model | 2 | 2 | 2 |
| domain-validation | 2 | 2 | 2 |
| firing-pattern-analysis (table) | 1s | 2s | 2 |
| firing-pattern-analysis (FiringSchedule) | startRound: 2 | every: 2 | 2 |

**Audit Finding**: Applying the implicit scale translation (1s delay → fires round 2 = warmup=2), values are equivalent. FiringSchedule confirms startRound=2 matching. The "consistent" verdict is **correct** — but again depends on undocumented scale translation. Verdict is defensible.

---

### 2.5 Claim: "Quantum Torpedo: Fully Consistent — warmup=4, cooldown=4, shots=1 — Supported across all sources"

This is the most significant finding in the audit.

| Source | Warmup | Cooldown | First Fire Round |
|--------|--------|----------|------------------|
| combat-model | 4 | 4 | Round 4 |
| domain-validation | 4 | 4 | Round 4 |
| firing-pattern-analysis (table) | 3s | 4s | Round 4 (under 0-indexed delay) |
| firing-pattern-analysis (FiringSchedule) | startRound: 5 | every: 4 | **Round 5** |
| firing-pattern-analysis (derived pattern) | — | — | **Round 5** (confirmed: "Round 5: Photon x1, Phaser x3, Quantum x1") |

**Critical Discrepancy**: The FiringSchedule in firing-pattern-analysis uses `startRound: 5`. The derived firing pattern confirms Quantum fires at rounds 5, 9, 13 — **not** rounds 4, 8, 12.

Under the 0-indexed delay model: warmup=3s → should yield startRound=4 (3+1=4). The FiringSchedule shows startRound=5, which is inconsistent with the table's warmup=3s even within firing-pattern-analysis itself.

In contrast, domain-validation and combat-model both use warmup=4 under the 1-indexed round model, which gives first fire at round 4.

**Audit Finding**: The report classifies Quantum as "Fully Consistent" and "Supported across all sources." This is **incorrect**. The firing-pattern-analysis FiringSchedule and derived pattern show Quantum first fires round 5, while domain-validation and combat-model derive round 4. This is a genuine discrepancy that was **missed** by the original report.

Additionally, firing-pattern-analysis itself contains an internal inconsistency for Quantum (table warmup=3s → expected startRound=4, but FiringSchedule has startRound=5). The report cited this document without noting its internal inconsistency.

---

### 2.6 Claim: "Photon Cooldown = 3: Unsupported — domain-validation shows cooldown=2, firing-pattern-analysis shows 2s"

| Source | Photon Cooldown |
|--------|----------------|
| combat-model/vengeance.ts | 3 |
| domain-validation/vengeance.ts | 2 |
| firing-pattern-analysis (table) | 2s |
| firing-pattern-analysis (FiringSchedule) | every: 2, startRound: 1 |

**Audit Finding**: The reported discrepancy is **accurate**. Cooldown=3 in combat-model is divergent from cooldown=2 across firing-pattern-analysis and domain-validation. This is the one finding in the original report that is traceable, accurate, and correctly described.

---

### 2.7 Claim: "3 of 4 Timing Parameters Consistent" (Section 8) / "14 of 16 parameters match" / "88% consistent" (Section conclusions)

**Audit Finding**: The report uses two different percentages in the same section (75% and 88%) without reconciling them:

- Section 8 Confidence Table: "75% of weapon parameters match" (Phaser, Pulse, Quantum = 3/4 weapons)
- Section conclusions: "88% consistent with documented hypothetical sources (14 of 16 parameters)"

These are inconsistent. The summary table has 19 data rows, not 16. The methodology for selecting "16 parameters" and calculating "88%" is not documented. If the Quantum discrepancy is included, neither figure is accurate in its current form.

---

## 3. Photon Cooldown Audit

### Files Containing cooldown=2 for Photon Torpedo

| File | Location | Value | Source Description |
|------|----------|-------|--------------------|
| `packages/domain-validation/src/examples/vengeance.ts` | line 22 | `cooldown: 2` | "HYPOTHETICAL - firing-pattern-analysis.md assumptions" |
| `docs/firing-pattern-analysis.md` | Vengeance table | `2s` | Theoretical analysis; explicitly NOT battle logs |
| `docs/firing-pattern-analysis.md` | FiringSchedule | `every: 2, startRound: 1` | Same document |

### Files Containing cooldown=3 for Photon Torpedo

| File | Location | Value | Source Description |
|------|----------|-------|--------------------|
| `packages/combat-model/src/examples/vengeance.ts` | line 28 | `cooldown: 3` | "approximations derived from earlier analysis and community references" |

### Traceability Analysis

- **domain-validation** explicitly states its source is "firing-pattern-analysis.md assumptions". These are not independent sources.
- **firing-pattern-analysis** explicitly disclaimed: "NOT actual battle logs", "Validation Status: ❌ Unverified".
- **combat-model** claims "approximations derived from earlier analysis and community references." Whether "earlier analysis" refers to firing-pattern-analysis.md is unknown. The divergence in cooldown value (2 vs 3) is not explained in any repository document.

### Did the Report Accurately Describe This Situation?

**Yes, with one qualification.** The report correctly identified that cooldown=3 in combat-model diverges from cooldown=2 in domain-validation and firing-pattern-analysis. It correctly noted no explanation is documented.

The qualification: the report did not note that domain-validation derives directly from firing-pattern-analysis. Both show cooldown=2, but they are not two independent sources confirming the same value — domain-validation was created from firing-pattern-analysis. The "two sources showing 2" is actually **one source showing 2**, with a downstream copy.

---

## 4. Confidence Assessment Audit

### 4.1 "65% Overall Confidence"

| Criterion | Status |
|-----------|--------|
| Derivation formula documented? | ❌ No |
| Inputs to calculation identified? | ❌ No |
| Reproducible by independent reviewer? | ❌ No |

**Finding**: The "65% overall confidence" figure appears to be an informal judgment synthesizing four bullet points (75% match, 25% diverge, 0% battle logs, 0% official sources). No formula is shown. The value cannot be independently reproduced.

### 4.2 "88% Consistent (14 of 16 parameters)"

| Criterion | Status |
|-----------|--------|
| Which 16 parameters are selected? | ❌ Not documented |
| How were they enumerated? | ❌ Not documented |
| Summary table has 19 rows — which 3 were excluded? | ❌ Not explained |
| Does the calculation account for Quantum discrepancy? | ❌ No |

**Finding**: "14 of 16" cannot be verified from the report's own data. With the Quantum discrepancy included, the number of consistent parameters is lower than claimed. The figure should be labeled as an estimate with uncertain methodology, not stated as a precise calculation.

### 4.3 "75% Match" vs "88% Consistent" — Same Section, Different Values

The report states in Section 8:
> "✅ 75% of weapon parameters match hypothetical sources (Phaser, Pulse, Quantum)"

And in Section conclusions:
> "Vengeance definition is 88% consistent with documented hypothetical sources"

**Finding**: These two percentages appear in the same section and cannot both be correct as stated. 75% = 3/4 weapons. 88% ≈ 14/16 parameters. One counts weapons; the other counts parameters. The distinction is not explained and the mixing of the two framings without labeling creates a false impression of precision.

### 4.4 "70% Confidence for Phaser/Pulse/Quantum"

The report assigns 70% confidence to warmup/cooldown/shots for the "3/4 weapons." This figure is cited from ASSUMPTION-001 in combat-assumptions.md, which assigns 90% confidence to the general derivation hypothesis, not to Vengeance specifically.

**Finding**: The 70% value is not derived from Vengeance evidence. It is borrowed from a general hypothesis about all ships. Using it as a Vengeance-specific confidence rating conflates domain-wide confidence with individual ship confidence. The report should distinguish: "General derivation model confidence: 90% (ASSUMPTION-001) — this does not constitute evidence that Vengeance's specific values are correct."

### Recommended Replacement Wording

Replace all numerical confidence percentages with qualitative statements grounded in documented evidence, for example:

| Current (Remove) | Replacement |
|---------|-------------|
| "65% overall confidence" | "Insufficient evidence to assign confidence; no battle-log data exists" |
| "88% consistent (14 of 16 parameters)" | "Most timing parameters are internally consistent with the hypothetical analysis, but at least two discrepancies exist (Photon cooldown, Quantum first-fire round)" |
| "70% confidence" | "Confidence inherited from ASSUMPTION-001; no Vengeance-specific evidence exists" |
| "95% confidence for weapon existence" | "Weapon names and types are internally consistent across repository documents; no external STFC validation performed" |

---

## 5. Policy Compliance Audit

**Policy Reference**: `docs/data-verification-policy.md`

Policy criteria for `verified` status:
> - Have weapon timing confirmed against battle logs or authoritative STFC source data
> - Document evidence source in commit messages or file comments
> - Be reproducible by independent verification

### Report's Justification for "Remain UNVERIFIED"

| Policy Criterion | Report's Reasoning | Audit Assessment |
|------------------|--------------------|-----------------|
| Battle logs required | "No battle logs present in repository" | ✅ Accurate |
| Official STFC data required | "No stfc.space extraction or official STFC data included" | ✅ Accurate |
| Evidence documentation required | "Cooldown discrepancy (3 vs 2) undocumented" | ✅ Accurate |
| Reproducibility required | (Implicit — not explicitly addressed) | ⚠️ Not stated but implied |

**Finding**: The "Remain UNVERIFIED" recommendation is **policy-compliant** and correctly justified. The policy criteria are clearly unmet; no battle logs, no official data, no extraction. The recommendation would remain correct even if the report's other findings were revised.

---

## 6. Circular Reasoning Assessment

### Chain 1: Primary Circular Chain

```
docs/firing-pattern-analysis.md
  → Contains hypothetical Vengeance weapon analysis
  → Explicitly: "based on HYPOTHETICAL values, NOT actual battle logs"

packages/domain-validation/src/examples/vengeance.ts
  → Source field: "HYPOTHETICAL - firing-pattern-analysis.md assumptions"
  → Directly derived from firing-pattern-analysis.md
  → All values ARE the values from firing-pattern-analysis (except Quantum warmup differs slightly)

docs/verification-reports/vengeance-verification.md
  → Cites BOTH as independent supporting evidence
  → "Consistent across domain-validation and firing-pattern-analysis"
```

**Assessment**: This is **confirmed circular reasoning**. Domain-validation is downstream from firing-pattern-analysis. Citing both to "corroborate" a value is not corroboration — it is citing one source and its copy. Every claim using this pattern (Phaser, Pulse, Quantum consistency) rests on a single-source chain presented as multi-source confirmation.

### Chain 2: Potential Shared Origin for combat-model

The combat-model vengeance.ts file header states: "approximations derived from earlier analysis and community references." If "earlier analysis" refers to firing-pattern-analysis.md, then the very definition being evaluated was derived from the same document now used as evidence to evaluate it.

**Assessment**: This is a **potential circular chain** but cannot be confirmed from repository contents alone. The header is ambiguous about what "earlier analysis" refers to. The audit cannot rule out that combat-model and firing-pattern-analysis have a shared origin. This possibility should be explicitly noted in the verification report.

### Chain 3: ASSUMPTION-001 Confidence Borrowing

```
docs/combat-assumptions.md
  → ASSUMPTION-001: "All ships can be derived from warmup/cooldown/shots; 90% confidence"
  → Evidence: "5/5 ships analyzed" (includes Vengeance itself)

docs/verification-reports/vengeance-verification.md
  → Cites ASSUMPTION-001 confidence to validate Vengeance parameters
```

**Assessment**: **Confirmed circular reasoning**. Vengeance is one of the 5 ships contributing evidence to ASSUMPTION-001. Using ASSUMPTION-001's confidence to validate Vengeance parameters is circular — Vengeance helps establish the assumption; the assumption is then used to support Vengeance.

---

## 7. Audit Verdict

### Summary of Findings

| Finding | Severity | Original Report Status |
|---------|----------|----------------------|
| Quantum Torpedo first-fire discrepancy missed | HIGH | Incorrectly classified as "Fully Consistent" |
| Circular reasoning: domain-validation cites firing-pattern-analysis | HIGH | Not identified |
| Internal inconsistency: Photon warmup classified differently in two sections | MEDIUM | Present in report |
| Opaque confidence percentages (65%, 88%, 70%, 75%) | MEDIUM | Not disclosed as informal |
| 75% vs 88% inconsistency within same section | MEDIUM | Present in report |
| "Validated as real STFC weapon" is overstated | MEDIUM | Not acknowledged |
| Warmup scale difference (0s vs 1) not documented | LOW | Not addressed |
| Shared origin of combat-model and firing-pattern-analysis not investigated | LOW | Not flagged |

### Correct Findings (Credit to Original Report)

| Finding | Assessment |
|---------|------------|
| Photon cooldown discrepancy (2 vs 3) | ✅ Accurate and well-described |
| "Remain UNVERIFIED" recommendation | ✅ Policy-compliant, correctly justified |
| No battle logs, no official data | ✅ Accurate |
| All weapons follow derivable pattern | ✅ Accurate (from the perspective of internal consistency with the model) |

---

## AUDIT VERDICT: PASS WITH CONCERNS

### Rationale

**PASS**: The core recommendation — `unverified` status — is correct, policy-justified, and is not undermined by the deficiencies found in this audit. The report successfully identified the Photon cooldown discrepancy, the most operationally significant finding.

**WITH CONCERNS**: Four issues require correction before the report should be relied upon for data governance decisions:

1. **Quantum Torpedo first-fire round discrepancy must be added** — firing-pattern-analysis shows rounds 5,9,13 while combat-model derives rounds 4,8,12. This is a second uncatalogued disagreement between sources.

2. **Circular reasoning must be acknowledged** — Domain-validation is not an independent corroborating source for firing-pattern-analysis. The report's "consistent across multiple sources" language is misleading when those sources share a documented lineage.

3. **Confidence percentages should be replaced with qualitative statements** — Numerical confidence without documented methodology creates false precision. The 75% vs 88% inconsistency is unexplained.

4. **Internal inconsistency on Photon warmup=1 must be resolved** — Section 4 says "Unknown"; summary table says "Supported." One must be removed.

### Recommended Follow-Up Actions

The following actions are **recommended for a future milestone** (not performed in this audit):

1. **Correct Quantum Torpedo assessment** — Add the first-fire round discrepancy (round 5 in firing-pattern-analysis vs round 4 in combat-model) to the unsupported findings in the verification report
2. **Correct Photon warmup classification** — Choose either "Unknown" (Section 4) or "Supported" (summary), not both; document the warmup scale translation used to reach the conclusion
3. **Replace numerical confidence percentages** with qualitative evidence-level statements
4. **Add note on source lineage** — Explicitly state that domain-validation was created from firing-pattern-analysis (not independent)
5. **Investigate shared origin** — Clarify whether combat-model/vengeance.ts "earlier analysis" refers to firing-pattern-analysis.md; document the answer in the verification report
6. **Add note on ASSUMPTION-001 circularity** — Flag that ASSUMPTION-001's 90% confidence includes Vengeance as one of its 5 ships; it cannot be used to independently validate Vengeance

---

**Audit Completed**: May 31, 2026
**Milestone**: 12A — Independent Audit of Vengeance Verification Report
**Subsequent Action**: Findings to be reviewed before relying on verification report for status decisions
