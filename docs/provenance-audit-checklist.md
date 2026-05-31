# Provenance Audit Checklist

**Purpose**: Quick-reference checklist for auditors reviewing ship data provenance.
**Reference**: `docs/data-provenance-policy.md` for full category definitions.

---

## Section 1 — Evidence Independence

Run this section for each cited source.

- [ ] **For each source cited in the document: does it have its own provenance documentation?**
      If no, flag as Unknown (Category F).

- [ ] **For each pair of corroborating sources: do they share a common upstream document?**
      If Source B cites Source A, they are not independent. Mark in audit notes.

- [ ] **Does any domain-validation file list its `source` field?**
      Read the field. If it cites another repository document, the two are not independent.
      `vengeance-validation` source: `"HYPOTHETICAL - firing-pattern-analysis.md assumptions"` → NOT independent of firing-pattern-analysis.

- [ ] **Does any file header say "derived from earlier analysis"?**
      Identify which document "earlier analysis" refers to. If it cannot be identified, provenance is Unknown (F).

---

## Section 2 — Evidence Authenticity

- [ ] **Does the cited source contain real STFC data (battle logs, stfc.space, patch notes)?**
      If no, it cannot support Category A or B provenance.

- [ ] **Does the cited source describe itself as hypothetical or approximate?**
      If yes, it is Category C, D, or E. Citing it as evidence does not increase confidence.

- [ ] **Does `firing-pattern-analysis.md` appear in any source chain?**
      This document explicitly declares "HYPOTHETICAL values, NOT actual battle logs."
      Any value traced to this document is at most Category C.

---

## Section 3 — Circular Reasoning Detection

- [ ] **Does Ship X appear in the evidence used to validate Ship X?**
      Example: ASSUMPTION-001 was validated against Augur, Vengeance, Kelvin, Borg Cube, Rotarran. Using ASSUMPTION-001 to validate Vengeance is circular because Vengeance contributed to ASSUMPTION-001.

- [ ] **Is the value in combat-model the same as the value in domain-validation?**
      If yes, check whether both derived from the same upstream document. If so, this is one source, not two.

- [ ] **Does the verification report cite two sources for the same value that both ultimately trace to one document?**
      This is a single-source chain presented as multi-source corroboration.

---

## Section 4 — Confidence Claim Validity

- [ ] **Is every confidence percentage or rating backed by a documented formula?**
      If no, label as "informal estimate" not a calculated figure.

- [ ] **Are multiple different percentage metrics used in the same section without explanation?**
      Example: "75% match" and "88% consistent" in the same paragraph — these cannot both be precise calculations.

- [ ] **Is a domain-wide confidence value (e.g., ASSUMPTION-001 at 90%) applied to a specific ship?**
      If yes, flag. Domain-wide figures do not directly translate to ship-specific confidence.

- [ ] **Are confidence percentages reproducible from the data shown?**
      Attempt to reproduce the figure. If the calculation cannot be reconstructed from the report's own data, the figure is not verifiable.

---

## Section 5 — Provenance Category Assignment

For each timing value (warmup, cooldown, shots) in a ship definition:

- [ ] **Is the origin documented?**
      If no → Category F (Unknown)

- [ ] **Was the value observed in recorded combat?**
      If yes, with source documented → Category A (Battle Log Evidence)

- [ ] **Was the value extracted from stfc.space or an official STFC publication?**
      If yes, with URL and date documented → Category B (Direct Source Extraction)

- [ ] **Was the value calculated from a documented method applied to other data?**
      If yes, with method and inputs documented → Category C (Derived Analysis)

- [ ] **Was the value estimated based on informal knowledge or community references?**
      If yes, with contributor's reasoning described → Category D (Approximation)

- [ ] **Was the value added as structural scaffolding with no accuracy claim?**
      If yes, explicitly marked → Category E (Placeholder)

---

## Section 6 — Known Repository-Wide Flags

The following issues have been documented and should be checked in every future audit:

| Issue | Location | Status |
|-------|----------|--------|
| `domain-validation/vengeance.ts` is not independent of `firing-pattern-analysis.md` | Both documents | Confirmed (M12A audit) |
| Photon Torpedo cooldown: combat-model uses 3, all other documents use 2 | combat-model vs domain-validation | Open — origin of 3 unexplained |
| Quantum Torpedo: combat-model derives first fire round 4; firing-pattern-analysis FiringSchedule shows round 5 | firing-pattern-analysis.md vs combat-model | Open — discrepancy undocumented |
| ASSUMPTION-001 includes Vengeance as one of its 5 evidence ships | combat-assumptions.md | Confirmed circular (M12A audit) |
| Augur warmup/cooldown/shots: no external source cited; origin undocumented | combat-model/augur.ts | Provenance Unknown (F) |
| Vengeance photon cooldown=3: "earlier analysis" reference not identified | combat-model/vengeance.ts | Provenance Unknown (F) |

---

## Audit Output Template

After completing the checklist, document findings in the following format:

```
## Provenance Audit: [Ship Name]
Date: [date]
Auditor: [role]

Evidence Independence:
  - [Source name]: Independent / Derived from [upstream doc]
  - ...

Circular Chains Found:
  - [Description] or "None found"

Confidence Claims:
  - [Claim]: Reproducible / Not reproducible / Informal estimate

Provenance Categories:
  | Weapon          | warmup | cooldown | shots |
  |-----------------|--------|----------|-------|
  | [weapon name]   | [Cat]  | [Cat]    | [Cat] |

Known Flags Checked: Yes / No
```
