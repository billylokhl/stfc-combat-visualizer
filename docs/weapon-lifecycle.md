# Weapon Lifecycle Reference

**Purpose**: Canonical explanation of weapon timing behavior in STFC Visual Intelligence.

**Last Updated**: May 31, 2026

---

## Overview

Weapons in STFC alternate between two states during combat:

1. **Charging** - Weapon is preparing to fire
2. **Firing** - Weapon activates and fires shots

There is no Idle state. A weapon is always either charging or firing.

---

## Source Data Model

Every weapon has three timing parameters from STFC game data (stfc.space):

### Warmup
**Type**: Positive integer (rounds)  
**Semantics**: The round number when the weapon first activates

**Examples**:
- `warmup=1` → weapon first fires in round 1
- `warmup=2` → weapon first fires in round 2  
- `warmup=3` → weapon first fires in round 3

**Visual State**: Before warmup round completes, weapon is **charging**.

### Cooldown
**Type**: Positive integer (rounds)  
**Semantics**: Number of rounds between weapon activations

**Examples**:
- `cooldown=1` → weapon fires every round
- `cooldown=2` → weapon fires every 2 rounds
- `cooldown=3` → weapon fires every 3 rounds

**Visual State**: Between activations, weapon is **charging**.

### Shots
**Type**: Positive integer  
**Semantics**: Number of projectiles fired per activation

**Examples**:
- `shots=1` → single projectile per activation
- `shots=2` → burst of 2 projectiles per activation
- `shots=4` → burst of 4 projectiles per activation

**Visual State**: During activation, all shots fire rapidly in sequence.

---

## Lifecycle States

### Charging State
**Duration**: Variable (depends on warmup and cooldown)  
**Behavior**: Weapon is preparing to fire  
**Visual Representation**: Static or subtle animation (not yet implemented)

**When Charging**:
- Initial warmup period (rounds 1 through warmup-1)
- Between activations (cooldown period)

**Transition**: Charging → Firing when activation round arrives

### Firing State
**Duration**: Brief (all shots fire within same round)  
**Behavior**: Weapon fires `shots` projectiles in rapid succession  
**Visual Representation**: Muzzle flash, recoil, projectile launch

**When Firing**:
- Round number equals warmup (first activation)
- Round number matches subsequent cooldown intervals

**Transition**: Firing → Charging after all shots complete

---

## Firing Algorithm

The combat model uses this algorithm to determine when a weapon fires:

```typescript
function weaponFiresOnRound(weapon: WeaponDefinition, round: number): boolean {
  const firstRound = weapon.warmup || 1;
  
  if (round < firstRound) {
    return false; // Still in initial charging phase
  }
  
  if (round === firstRound) {
    return true; // First activation
  }
  
  return (round - firstRound) % weapon.cooldown === 0; // Subsequent activations
}
```

**Current Implementation Note**: The code currently contains a bug (`firstRound = 1 + warmup`). This will be corrected to match the semantics above.

---

## Real-World Examples

### Example 1: Augur Beam Array

**Source Data**:
- warmup=1
- cooldown=1  
- shots=2

**Firing Pattern** (rounds 1-10):
```
Round 1: FIRES (2 shots) - first activation
Round 2: FIRES (2 shots) - cooldown complete
Round 3: FIRES (2 shots) - cooldown complete
Round 4: FIRES (2 shots) - cooldown complete
Round 5: FIRES (2 shots) - cooldown complete
Round 6: FIRES (2 shots) - cooldown complete
Round 7: FIRES (2 shots) - cooldown complete
Round 8: FIRES (2 shots) - cooldown complete
Round 9: FIRES (2 shots) - cooldown complete
Round 10: FIRES (2 shots) - cooldown complete
```

**Lifecycle**:
- No charging period (warmup=1, fires immediately in round 1)
- Fires continuously (cooldown=1, every round)
- Each activation: 2 rapid shots

### Example 2: Augur Obliterator Torpedo

**Source Data**:
- warmup=2
- cooldown=3
- shots=1

**Firing Pattern** (rounds 1-15):
```
Round 1: CHARGING - waiting for warmup
Round 2: FIRES (1 shot) - first activation
Round 3: CHARGING - cooldown period
Round 4: CHARGING - cooldown period
Round 5: FIRES (1 shot) - cooldown complete
Round 6: CHARGING - cooldown period
Round 7: CHARGING - cooldown period
Round 8: FIRES (1 shot) - cooldown complete
Round 9: CHARGING - cooldown period
Round 10: CHARGING - cooldown period
Round 11: FIRES (1 shot) - cooldown complete
Round 12: CHARGING - cooldown period
Round 13: CHARGING - cooldown period
Round 14: FIRES (1 shot) - cooldown complete
Round 15: CHARGING - cooldown period
```

**Lifecycle**:
- Initial charging: round 1
- First activation: round 2 (warmup=2)
- Subsequent pattern: fires every 3 rounds (cooldown=3)
- Each activation: 1 shot

---

## Activation vs Shot

**Critical Distinction**:

**Activation**:
- Weapon becomes active in a round
- Triggers the firing sequence
- Occurs once per firing round

**Shot**:
- Individual projectile or beam pulse
- Multiple shots can occur per activation
- Fire in rapid succession within the same round

**Example**:
```
Weapon activation (1 event)
└─ Shot 1 (projectile)
└─ Shot 2 (projectile)
└─ Shot 3 (projectile)
└─ Shot 4 (projectile)
```

A weapon with `shots=4` fires **four consecutive shots** when activated.

**Implementation**:
- Combat model generates **one CombatEvent** per activation
- CombatEvent contains `shots` field
- Visualization model expands into multiple visual events (muzzle flash, recoil, projectile per shot)

---

## Visualization Implications

### Current Rendering (Ship Animator v0)
- Charging state: No animation (weapon simply waits)
- Firing state: Muzzle flash, recoil, projectile launch sequence
- Multi-shot weapons: Individual shots animated with timing delays

### Future Rendering Considerations

**Charging Animation** (not yet implemented):
- Potential visual: energy buildup, charge glow, power cycling
- Should indicate weapon is preparing to fire
- Should scale with remaining charge time

**Firing Animation** (currently implemented):
- Recoil (visual feedback of weapon activation)
- Muzzle flash (moment of discharge)
- Projectile launch (visible projectile)

**Multi-Shot Timing**:
- Current model: 50ms interval between shots
- Shots fire rapidly but distinctly
- All shots complete within the same combat round

---

## Domain Correctness Notes

### What We Know
✅ Warmup/cooldown/shots values exist in STFC game data  
✅ Pattern derivation algorithm produces expected results  
✅ Augur firing pattern validated via demos  
✅ Visualization layer successfully consumes combat events

### What We Assume
🔬 Weapon listing order determines firing order (when warmup is equal)  
🔬 Round duration is constant at 1 second  
🔬 All weapons follow warmup/cooldown model (no irregular patterns)

### What We Don't Know
❓ How officer abilities affect weapon timing  
❓ How critical hits or special effects modify firing  
❓ Multi-ship combat sequencing (attacker vs defender)  
❓ Whether any ships have non-standard weapon timing

**Validation Status**: See [docs/combat-assumptions.md](combat-assumptions.md) for detailed assumption tracking.

---

## Developer Guidelines

### When implementing weapon timing:
1. **Use source data** (warmup/cooldown/shots) as single source of truth
2. **Derive firing patterns** - do not author firing schedules manually
3. **Preserve layer separation** - renderer should not know warmup/cooldown semantics
4. **Validate with demos** - run `npm run demo:augur` to verify firing patterns

### When adding new ships:
1. Extract warmup/cooldown/shots from stfc.space
2. Define weapon in ship-model package
3. Generate combat events via combat-model
4. Verify firing pattern matches expectations

### When debugging timing issues:
1. Check warmup bug fix is applied (`firstRound = weapon.warmup || 1`)
2. Verify cooldown calculation: `(round - firstRound) % cooldown === 0`
3. Run demos to see actual vs expected patterns
4. Consult this document for lifecycle semantics

---

## Related Documentation

- [Domain Notes](domain-notes.md) - Confirmed facts and assumptions
- [Combat Assumptions](combat-assumptions.md) - Assumption registry with confidence levels
- [Architecture](architecture.md) - System design and package responsibilities
- [Firing Pattern Analysis](firing-pattern-analysis.md) - Ship-by-ship pattern analysis
