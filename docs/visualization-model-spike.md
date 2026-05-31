# Visualization Model Spike - Design Document

## Overview

This document describes the visualization model layer that transforms combat events into visual timeline events.

The goal was to prove that:

**Ship Definition → Firing Pattern → Combat Events → Visual Events**

can be represented cleanly using a framework-agnostic abstraction.

---

## Core Principle

**Combat events represent gameplay.**

**Visual events represent presentation.**

These are not the same thing.

A combat event says "weapon fired."

A visual event says "show muzzle flash at 50ms, launch projectile at 100ms."

---

## Design Philosophy

### Separation of Concerns

The visualization model exists to decouple:

**Combat Logic** (what happens in the game)

from

**Animation Logic** (how it looks on screen)

A future animation engine should consume visual events without understanding STFC firing patterns, weapon schedules, or combat mechanics.

### Framework Agnostic

The visualization model:
- Has no React dependencies
- Has no DOM dependencies
- Has no Canvas dependencies
- Has no browser dependencies
- Has no CSS
- Has no animation playback logic

It produces pure data structures that describe animation intent.

---

## Visual Event Types

Five event types support ship firing pattern animation:

### 1. `muzzle_flash`
Visual indicator that a weapon has discharged.

**Purpose:** Show weapon activation.

**Typical duration:** 50-100ms flash effect.

### 2. `recoil`
Visual indicator of weapon kickback.

**Purpose:** Show weapon physics/power.

**Typical duration:** 100-200ms recoil animation.

### 3. `projectile_launch`
Spawning of a projectile visual.

**Purpose:** Create projectile that travels to target.

**Typical duration:** Projectile travels until impact (varies).

### 4. `impact`
Visual indicator of projectile hitting target.

**Purpose:** Show damage delivery.

**Typical duration:** 50-150ms impact effect.

**Note:** Not yet implemented (out of scope for Milestone 2).

### 5. `round_marker`
Timeline marker indicating round start.

**Purpose:** Synchronize round-based combat flow.

**Typical duration:** Instantaneous.

---

## Timing Model

Visual events use **timestamp-based sequencing**.

### Timestamp Definition

Each visual event has a `timestamp` field measured in **milliseconds from round start**.

Example:
```typescript
{
  type: 'muzzle_flash',
  timestamp: 50,  // 50ms after round begins
  weaponId: 'left_beam',
  hardpoint: 'left_beam'
}
```

### Why Milliseconds?

- Natural unit for animation timing
- Matches browser animation APIs (requestAnimationFrame, CSS transitions)
- Human-readable scale (0-2000ms per round)
- Precise enough for smooth animation

### Timing Configuration

The `VisualTimingConfig` structure controls event timing:

```typescript
interface VisualTimingConfig {
  muzzleFlashDelay: number;      // Delay before muzzle flash
  recoilDelay: number;            // Delay before recoil
  projectileLaunchDelay: number;  // Delay before projectile
  shotInterval: number;           // Delay between shots in burst
  baseDelayByPosition: {          // Position-based weapon delays
    left: number;
    right: number;
    center: number;
    top: number;
    bottom: number;
  };
}
```

**Default timing:**
- Muzzle flash: 50ms after weapon activation
- Recoil: 0ms (immediate)
- Projectile launch: 100ms after weapon activation
- Shot interval: 50ms between shots in a burst
- Position delays:
  - Left: 0ms (fires first)
  - Right: 200ms (fires second)
  - Center: 400ms (fires third)
  - Top: 600ms
  - Bottom: 800ms

### Position-Based Sequencing

Weapons fire in sequence based on hardpoint position to prevent visual overlap.

**Rationale:**
- Prevents simultaneous effects from obscuring each other
- Creates visual rhythm
- Easier to track individual weapon contributions
- More cinematic presentation

**Example (Round 2):**

```
   0ms: Left Beam fires (position: left, delay: 0ms)
 200ms: Right Beam fires (position: right, delay: 200ms)
 400ms: Obliterator fires (position: center, delay: 400ms)
```

This creates a left → right → center firing sequence.

---

## Hardpoint System

Hardpoints define the physical locations of weapons on a ship.

### HardpointDefinition

```typescript
interface HardpointDefinition {
  id: string;                // Hardpoint identifier
  name: string;              // Display name
  position: 'left' | 'right' | 'center' | 'top' | 'bottom';
  weaponType?: 'beam' | 'kinetic' | 'energy' | 'special';
}
```

### Purpose

1. **Rendering Position** - Tell animator where effects appear
2. **Timing Sequencing** - Determine weapon firing order
3. **Visual Styling** - Different weapon types may render differently

### Augur Hardpoints

```typescript
[
  { id: 'left_beam', position: 'left', weaponType: 'beam' },
  { id: 'right_beam', position: 'right', weaponType: 'beam' },
  { id: 'obliterator', position: 'center', weaponType: 'special' }
]
```

### Hardpoint Matching

Weapons reference hardpoints via the `hardpoint` field in `WeaponDefinition`:

```typescript
{
  id: 'left_beam',
  name: 'Left Beam',
  hardpoint: 'left_beam',  // References hardpoint.id
  // ...
}
```

The visualization model uses this to:
1. Find the hardpoint definition
2. Determine position-based timing delay
3. Attach hardpoint metadata to visual events

---

## Combat-to-Visual Transformation

The core transformation logic maps combat events to visual events.

### Transformation Rules

#### Rule 1: weapon_fired → recoil + muzzle_flash + projectile_launch

When a weapon fires, generate three visual events:

1. **Recoil** at `baseDelay + 0ms`
2. **Muzzle flash** at `baseDelay + 50ms`
3. **Projectile launch** at `baseDelay + 100ms`

Where `baseDelay` is determined by hardpoint position.

#### Rule 2: Multi-shot weapons create per-shot events

A weapon firing 2 shots generates 6 visual events:

- Shot 1: recoil, muzzle flash, projectile (0ms base)
- Shot 2: recoil, muzzle flash, projectile (50ms offset)

#### Rule 3: round_start → round_marker

Round start events become round markers at timestamp 0.

#### Rule 4: round_end events are ignored

Round end events carry no visual significance.

### Transformation Function

```typescript
transformRoundToVisual(
  roundEvents: RoundEvents,
  ship: Ship,
  hardpoints: HardpointDefinition[],
  config: VisualTimingConfig
): VisualRoundTimeline
```

**Input:**
- Combat events for one round
- Ship definition
- Hardpoint definitions
- Timing configuration

**Output:**
- Ordered visual events with timestamps
- Round duration

**Process:**
1. Add round marker at t=0
2. For each `weapon_fired` event:
   - Find weapon definition
   - Find hardpoint definition
   - Calculate base timing offset
   - Generate recoil/flash/projectile events
   - Apply shot intervals for multi-shot weapons
3. Sort all events by timestamp
4. Calculate total round duration

---

## Data Structures

### VisualEvent

```typescript
interface VisualEvent {
  type: VisualEventType;
  timestamp: number;
  weaponId?: string;
  hardpoint?: string;
  data?: {
    shotIndex?: number;
    totalShots?: number;
    round?: number;
  };
}
```

**Design notes:**
- Lightweight and serializable
- No references to complex objects
- Easy to log, debug, and transmit
- Contains all information needed for rendering

### VisualRoundTimeline

```typescript
interface VisualRoundTimeline {
  round: number;
  events: VisualEvent[];
  duration: number;
}
```

Containers for all visual events in a round, sorted by timestamp.

### ShipVisualConfig

```typescript
interface ShipVisualConfig {
  ship: Ship;
  hardpoints: HardpointDefinition[];
}
```

Bundles ship definition with hardpoint layout.

---

## Augur Example Output

### Round 1 Visual Events

Round 1 has no Obliterator (fires starting round 2).

**Events:**
```
   0ms: round_marker
   0ms: recoil (left_beam, shot 1)
  50ms: muzzle_flash (left_beam, shot 1)
  50ms: recoil (left_beam, shot 2)
 100ms: projectile_launch (left_beam, shot 1)
 100ms: muzzle_flash (left_beam, shot 2)
 150ms: projectile_launch (left_beam, shot 2)
 200ms: recoil (right_beam, shot 1)
 250ms: muzzle_flash (right_beam, shot 1)
 250ms: recoil (right_beam, shot 2)
 300ms: projectile_launch (right_beam, shot 1)
 300ms: muzzle_flash (right_beam, shot 2)
 350ms: projectile_launch (right_beam, shot 2)
```

**Duration:** 850ms

### Round 2 Visual Events

Round 2 adds Obliterator firing.

**Events:**
```
   0ms: round_marker
   0ms: recoil (left_beam, shot 1)
  50ms: muzzle_flash (left_beam, shot 1)
  50ms: recoil (left_beam, shot 2)
 100ms: projectile_launch (left_beam, shot 1)
 100ms: muzzle_flash (left_beam, shot 2)
 150ms: projectile_launch (left_beam, shot 2)
 200ms: recoil (right_beam, shot 1)
 250ms: muzzle_flash (right_beam, shot 1)
 250ms: recoil (right_beam, shot 2)
 300ms: projectile_launch (right_beam, shot 1)
 300ms: muzzle_flash (right_beam, shot 2)
 350ms: projectile_launch (right_beam, shot 2)
 400ms: recoil (obliterator)
 450ms: muzzle_flash (obliterator)
 500ms: projectile_launch (obliterator)
```

**Duration:** 1000ms

Notice the clear left → right → center sequence.

---

## What This Model Does NOT Cover

By design, the following are **out of scope** for Milestone 2:

### Rendering
- Canvas/WebGL drawing
- Sprite animation
- Particle effects
- Visual effects implementation

### Playback
- Animation loop
- Frame timing
- Pause/play controls
- Speed adjustment

### Interaction
- Click handlers
- Hover effects
- UI controls

### Advanced Effects
- Sound
- Screen shake
- Camera movement
- Dynamic lighting
- Shield effects
- Damage numbers

**Rationale:**

The visualization model produces *data describing what to animate*.

A future animation engine consumes this data and implements rendering.

This separation allows:
- Testing animation logic without a renderer
- Swapping renderers (Canvas, WebGL, CSS, etc.)
- Sharing visual timelines across platforms
- Debugging animation timing independently

---

## Future Extension Points

The current design supports future enhancements:

### 1. Impact Events

Add impact events when projectiles hit targets:

```typescript
{
  type: 'impact',
  timestamp: 800,  // Projectile travel time
  weaponId: 'left_beam',
  hardpoint: 'left_beam'
}
```

Requires modeling projectile travel time or target distance.

### 2. Shield Effects

Add shield flare events when shields absorb damage:

```typescript
{
  type: 'shield_flare',
  timestamp: 810,  // Shortly after impact
  data: { damageAbsorbed: 2500 }
}
```

### 3. Damage Numbers

Add floating damage number events:

```typescript
{
  type: 'damage_number',
  timestamp: 820,
  data: { damage: 5000, damageType: 'energy' }
}
```

### 4. Camera Shake

Add screen shake events for powerful weapons:

```typescript
{
  type: 'camera_shake',
  timestamp: 400,
  data: { intensity: 0.5, duration: 200 }
}
```

### 5. Officer Abilities

Model officer ability visual effects:

```typescript
{
  type: 'officer_ability',
  timestamp: 0,
  data: { officerName: 'Pike', abilityName: 'Maneuver' }
}
```

### 6. Multi-Ship Combat

Extend to include attacker/defender ship IDs:

```typescript
interface VisualEvent {
  shipId: string;  // Which ship is performing the action
  targetShipId?: string;  // Which ship is receiving the action
  // ...
}
```

### 7. Variable Timing

Allow timing to vary based on weapon properties:

```typescript
// Fast weapons
config.baseDelayByWeaponType = {
  beam: 100,
  kinetic: 150,
  special: 200
};
```

---

## Architectural Observations

### What Worked Well

1. **Clean Separation**
   - Combat model knows nothing about visualization
   - Visualization model knows nothing about rendering
   - Each layer has a single responsibility

2. **Type Safety**
   - TypeScript prevents invalid event types
   - Hardpoint references are checked at compile time
   - Timing configuration is strongly typed

3. **Testability**
   - Pure transformation functions
   - No side effects
   - Easy to assert expected visual events

4. **Debuggability**
   - Visual events are plain objects
   - Easy to log and inspect
   - Timeline can be printed as text

5. **Flexibility**
   - Timing is configurable
   - Easy to adjust visual feel without changing combat logic
   - New event types can be added without breaking existing code

### Potential Issues

1. **Timing Complexity**
   - Current model uses fixed delays
   - Real games may need variable timing based on weapon type, ship speed, etc.
   - Mitigation: Extend `VisualTimingConfig` as needed

2. **Event Volume**
   - Multi-shot weapons generate many events (6 events per 2-shot weapon)
   - Long battles may produce thousands of events
   - Mitigation: Generate events lazily or on-demand

3. **Hardpoint Coupling**
   - Hardpoint IDs must match between ship definition and hardpoint definitions
   - Typos cause silent failures
   - Mitigation: Add validation or use TypeScript literal types

4. **Missing Impact Timing**
   - Current model doesn't calculate when projectiles hit
   - Future animators will need to estimate or receive this data
   - Mitigation: Add projectile travel time to weapon definitions

### Design Discoveries

1. **Position-Based Sequencing is Essential**
   - Without position delays, all weapons fire simultaneously
   - Simultaneous effects are visually confusing
   - Staggered timing creates rhythm and clarity

2. **Shot-Level Granularity Matters**
   - Treating "2 shots" as one event loses animation detail
   - Individual shot events allow realistic burst fire animation
   - Small price to pay for visual quality

3. **Timestamps > Frame Numbers**
   - Millisecond timestamps are resolution-agnostic
   - Works at any frame rate
   - Easy to interpolate for smooth animation

4. **Events Should Be Minimal**
   - Visual events don't need ship definitions or weapon objects
   - IDs and primitive values are sufficient
   - Keeps events lightweight and serializable

### Lessons Learned

1. **Start With Output**
   - Began by imagining what an animator needs
   - Worked backward to define the model
   - This produced cleaner abstractions than starting with combat events

2. **Timing is a First-Class Concern**
   - Cannot treat timing as an afterthought
   - Timing configuration must be explicit and tunable
   - Different games/ships may need different timing feels

3. **Avoid Premature Abstraction**
   - Didn't try to model all possible effects
   - Focused on firing patterns only
   - Can add shield effects, officer abilities, etc. later

4. **Documentation of Intent Matters**
   - Explained *why* events exist, not just *what* they are
   - Future maintainers will understand design decisions
   - Makes extension points obvious

---

## Risks Before Ship Animator v0

### Risk 1: Timing Feel

**Issue:** Default timing values are guesses.

**Impact:** Animation may feel too slow, too fast, or unnatural.

**Mitigation:**
- Make timing easily adjustable
- Plan to iterate based on visual feedback
- Consider ship-specific timing overrides

### Risk 2: Hardpoint Positioning

**Issue:** Current model uses position labels (`left`, `right`, `center`).

**Impact:** Real renderer needs pixel coordinates or percentages.

**Mitigation:**
- Add optional coordinate fields to `HardpointDefinition`
- Keep position labels for sequencing
- Let renderer handle exact placement

### Risk 3: Missing Impact Events

**Issue:** Projectiles launch but never hit anything.

**Impact:** Incomplete animation loop.

**Mitigation:**
- Add impact generation in next milestone
- Estimate travel time based on visual preference
- Or require ship-to-ship distance input

### Risk 4: Event Volume

**Issue:** Round 2 generates 19 events.

**Impact:** Complex rounds (6+ weapons) could generate 50+ events.

**Mitigation:**
- Profile event generation performance
- Consider event pooling if needed
- Lazy generation for long timelines

### Risk 5: Synchronization

**Issue:** Visual timeline assumes animations play at correct speed.

**Impact:** If animations run slow, timing drifts.

**Mitigation:**
- Animator must use wall-clock time, not frame count
- Timestamps are absolute, not cumulative
- Consider adding duration hints to events

---

## Success Criteria Review

✅ **Visual events are framework-agnostic domain objects**
   Pure TypeScript interfaces, no framework dependencies.

✅ **Combat events can be transformed into visual events**
   `transformCombatToVisual()` implemented and tested.

✅ **Augur rounds 1-5 represented as visual timelines**
   Demo script generates and displays all rounds.

✅ **Timing and sequencing concepts exist**
   Timestamp-based model with configurable timing.

✅ **Documentation explains the model**
   This document covers design decisions and extension points.

✅ **Demo script works**
   `npm run demo:visual` outputs visual event timelines.

---

## Next Steps

Potential future milestones:

1. **Ship Animator v0**
   - Build React component consuming visual events
   - Implement Canvas/CSS rendering
   - Add playback controls (play, pause, speed)

2. **Impact Event Generation**
   - Calculate projectile travel times
   - Generate impact events
   - Model shield vs hull hits

3. **Advanced Visual Effects**
   - Shield flare animations
   - Damage numbers
   - Screen shake for powerful weapons
   - Particle effects

4. **Officer Visual Integration**
   - Model officer ability activation effects
   - Buff/debuff indicators
   - Cooldown visualizations

5. **Multi-Ship Combat Visualization**
   - Extend to attacker/defender model
   - Show projectiles traveling between ships
   - Damage feedback on both ships

---

## Conclusion

The visualization model successfully demonstrates that combat events can be transformed into renderable visual timelines using a clean, framework-agnostic abstraction.

The design is:
- **Decoupled** - Combat logic separate from presentation logic
- **Type-safe** - Leverages TypeScript for correctness
- **Testable** - Pure functions with deterministic outputs
- **Extensible** - Supports future effects without breaking changes
- **Debuggable** - Plain objects easy to inspect and log

The Augur example validates the architecture and provides a solid foundation for the Ship Animator application.
