# Data Provenance Policy

**Version**: 1.0
**Created**: May 31, 2026 (Milestone 13)
**Status**: Active

---

## 1. Purpose

Provenance tracks the origin and lineage of ship data. It answers the question: **where did this value come from, and can it be independently verified?**

Verification status (see `data-verification-policy.md`) answers *"has this data been validated?"*
Provenance answers *"how did this data come to exist in the first place?"*

Both are needed. A value can be well-provenanced (its origin is clearly traced) but still unverified (no battle log confirms it). A value can also be poorly provenanced — its origin is ambiguous — regardless of whether it has been checked against a battle log.

**Provenance categories must be assigned to every timing value (warmup, cooldown, shots) in ship definitions when the origin is known or discoverable.**

---

## 2. Provenance Categories

There are six categories. Exactly one category applies to each data element.

### Category A — Battle Log Evidence

**Definition**: The value was directly observed in recorded STFC combat (screenshots, video frame analysis, or exported battle logs). The observation method is documented.

**Criteria**:
- A specific observation source exists (e.g., "video analysis, Mission X, 2026-05-30")
- The firing round or pattern was directly measured
- The method is reproducible by another person reviewing the same source

**When to Use**: The value has been confirmed against real in-game combat.

**Current Use in Repository**: None. No battle log data has been collected.

---

### Category B — Direct Source Extraction

**Definition**: The value was extracted directly from an authoritative external STFC data source (stfc.space weapon database, official game files, developer patch notes, official community tools).

**Criteria**:
- A specific external URL, file, or publication is referenced
- The extraction date is documented
- The field name in the external source is identified

**When to Use**: The value came from an authoritative external source, regardless of whether battle logs confirm it.

**Current Use in Repository**: None. No stfc.space extractions have been performed.

---

### Category C — Derived Analysis

**Definition**: The value was calculated or inferred from first principles, theoretical models, or a structured analytical method applied to known data. The derivation method is documented.

**Criteria**:
- The derivation method is explicitly described
- The inputs are identified (even if those inputs are themselves approximate)
- The derivation is reproducible given the same inputs

**When to Use**: Values derived using the warmup/cooldown/shots algorithm from observed patterns, or values logically inferred from known game mechanics.

**Limitation**: Derived analysis is only as reliable as its inputs. If inputs are Approximations (Category D), the derived output inherits that limitation.

**Current Use in Repository**: `docs/firing-pattern-analysis.md` contains derived analysis. Values were derived theoretically, not from observed data. This document is Category C, with Category D inputs.

---

### Category D — Approximation

**Definition**: The value is an estimate based on informal reasoning, partial community knowledge, or general familiarity with the game. No structured derivation or direct observation backs the value, but the contributor has experience-based confidence.

**Criteria**:
- The source of the estimate is described (e.g., "community forum discussion", "player estimate", "earlier informal analysis")
- The contributor does not claim the value is exact
- The value has not been checked against a structured source

**When to Use**: Values entered by contributors who believe a value to be approximately correct based on game experience.

**Current Use in Repository**:
- `packages/combat-model/src/examples/vengeance.ts`: "approximations derived from earlier analysis and community references"
- `packages/combat-model/src/examples/kelvin.ts`: "approximations intended to validate catalog support"

---

### Category E — Placeholder

**Definition**: The value is not intended to be accurate. It exists only to satisfy structural requirements (type checking, catalog validation, demo execution).

**Criteria**:
- The contributor explicitly marks the value as a placeholder
- The value has not been checked against any source
- The expectation is that the value will be replaced when real data arrives

**When to Use**: Scaffolding values when the real values are unknown and no estimate is available.

**Current Use in Repository**: `packages/visualization-model/src/examples/vengeance-visual.ts` marks itself as a placeholder for visual definition.

---

### Category F — Unknown

**Definition**: The origin of the value cannot be traced from available repository documents. Either the value was added without documentation, or the documentation has been lost.

**Criteria**:
- No file comment, commit message, or linked document explains where the value came from
- The auditor cannot trace a plausible derivation chain

**When to Use**: When provenance review cannot identify the source.

**Special Case**: If a value is suspected to be an Approximation (D) but lacks documentation, classify it as Unknown (F) and note the suspicion. Do not infer Category D without evidence of intent.

---

## 3. Summary Table

| Category | Label | Source Required | Reproducible? | Current Use |
|----------|-------|----------------|---------------|-------------|
| A | Battle Log Evidence | Yes — specific observation | Yes | None |
| B | Direct Source Extraction | Yes — specific URL/file | Yes | None |
| C | Derived Analysis | Yes — method documented | Yes (given inputs) | firing-pattern-analysis.md |
| D | Approximation | Yes — source described | No | vengeance.ts, kelvin.ts |
| E | Placeholder | Explicit marking required | N/A | vengeance-visual.ts |
| F | Unknown | None | No | Some combat-model notes |

---

## 4. Usage Rules

### R1 — All Timing Values Must Have Provenance
Every weapon timing field (warmup, cooldown, shots) in a ship definition must have a provenance category. New ship definitions without explicit provenance must default to Unknown (F).

### R2 — Provenance Is Recorded in Catalog Notes
Catalog entries must include a `provenanceCategory` or equivalent description in the `notes` field or a dedicated metadata field. One-word labels (A through F) or the full category name are acceptable.

### R3 — Downstream Documents Inherit Provenance
If Document X derives its values from Document Y, Document X's provenance is at most Category C (Derived Analysis) — it cannot inherit a higher provenance category than its source. If Y is Category D, X is at most Category C with Category D inputs.

### R4 — Source Chains Must Be Documented
If provenance is Category C (Derived Analysis), the document must identify its inputs and their own provenance categories. This prevents hidden circular chains.

### R5 — Independence Must Be Verified
Two sources that both point back to the same original document are not independent. Citing both to "corroborate" a value is not valid corroboration. Auditors must check source lineage.

### R6 — Provenance Does Not Imply Correctness
A value with Category A provenance (battle log) may still be wrong if the battle log was misread. Provenance tracks origin; verification tracks whether the value has been independently confirmed.

---

## 5. Audit Expectations

When auditing a ship definition, auditors must:

1. **Trace every timing value** to a provenance category
2. **Check independence** — verify that cited corroborating sources are not derived from each other
3. **Identify unknown origins** — flag any value where provenance cannot be traced
4. **Document circular chains** — if Source A cites Source B and Source B cites Source A (or both cite a shared unknown original), record this as a circular chain
5. **Assess inherited provenance** — check whether Category C documents have documented their inputs

Auditors must **not** assume a value is correct because it has high-category provenance. Provenance and correctness are separate assessments.

---

## 6. Examples from this Repository

### Example 1: Augur Obliterator — Provenance Category F (Unknown)

The Augur `obliterator` weapon uses warmup=2, cooldown=3, shots=1. The file header describes the document as a "reference implementation demonstrating the combat event model." No explicit external source is cited. The file does not state whether these values came from stfc.space, battle logs, community estimates, or were invented for demonstration purposes.

**Assigned Category**: F — Unknown

**What Would Upgrade It**: A file comment identifying the source ("extracted from stfc.space on [date]", "confirmed in video analysis", etc.)

---

### Example 2: Vengeance Photon Torpedo Cooldown — Provenance Category F (Unknown, with noted divergence)

The cooldown value in `combat-model/vengeance.ts` is 3. The file header states "approximations derived from earlier analysis and community references." The `domain-validation` equivalent holds cooldown=2, citing `firing-pattern-analysis.md`. Neither value has been traced to an independent source.

**Combat-model cooldown=3**: Category F — "earlier analysis" is not identified; diverges from all other repository documents without explanation

**Domain-validation cooldown=2**: Category C — Derived from firing-pattern-analysis.md (itself Category C with no real-world inputs)

**What Would Clarify It**: Identify what "earlier analysis" refers to in the combat-model file header, or confirm whether the value was manually entered as an estimate.

---

### Example 3: Firing Pattern Analysis — Provenance Category C (Derived Analysis with no real-world inputs)

`docs/firing-pattern-analysis.md` explicitly states: "This analysis is based on HYPOTHETICAL warmup/cooldown/shots values, NOT actual battle logs." The values were theoretically derived to demonstrate the derivation algorithm.

**Category**: C — Derived Analysis. Inputs are explicitly not real-world observations.

**Important**: Documents that cite firing-pattern-analysis.md as a source inherit Category C at best, not A or B.

---

### Example 4: Kelvin Timing Values — Provenance Category D (Approximation)

`kelvin.ts` states: "Timing values are approximations intended to validate catalog support." The contributor explicitly acknowledges the values are approximate. No specific source is cited.

**Category**: D — Approximation

---

### Example 5: Vengeance Visual Definition — Provenance Category E (Placeholder)

`vengeance-visual.ts` is marked: "Placeholder — visual details should be refined later." The file explicitly signals that values are structural, not accurate.

**Category**: E — Placeholder
