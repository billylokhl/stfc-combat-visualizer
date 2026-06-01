# Architecture Skeleton

## Guiding Principle
Business logic must be independent from presentation.

Animations, React components, visualizations, and user interfaces should consume data and events produced by shared domain models.

UI should never contain ship-specific combat logic.

---

## Relationship to Domain Notes

**This architecture is based on our current understanding of STFC combat mechanics.**

Before modifying `combat-model`, `ship-model`, `visualization-model`, or `ship-animator`, consult:

**[docs/domain-notes.md](domain-notes.md)**

Domain notes document:
- Confirmed discoveries about STFC combat mechanics
- Likely-true assumptions with confidence levels and evidence
- Open questions requiring research
- Architectural implications of domain understanding

**Architecture should follow domain understanding, not the other way around.**

When domain understanding changes (new discoveries, corrected assumptions), architecture should adapt accordingly. If research reveals that the current model misrepresents STFC mechanics, the model should be refactored to match reality.

Before proposing architectural changes to domain models:
1. Check domain notes for relevant discoveries and assumptions
2. Identify what domain knowledge supports or contradicts the change
3. Update domain notes with new findings
4. Ensure the change improves domain correctness, not just code elegance

---

## Monorepo Structure
stfc-combat-visualizer/

docs/

packages/
ship-model/
combat-model/
asset-library/

apps/
ship-animator/

Additional packages and applications may be added over time.

---

## Core Domain Models

### Ship
Represents a ship and its metadata.

Responsibilities:

- identity
- classification
- statistics
- weapon definitions
- firing pattern definitions

### Weapon
Represents an individual weapon system.

Responsibilities:

- weapon identity
- weapon type classification
- damage type
- average damage
- timing parameters (warmup, cooldown, shots)
- hardpoint assignment

**Timing Model** (as of Milestone 6):
- **warmup**: round number when weapon first activates (warmup=1 → fires in round 1)
- **cooldown**: rounds between subsequent activations
- **shots**: projectiles per activation

**Weapon Lifecycle**: Weapons alternate between Charging (warmup/cooldown periods) and Firing (activation with shots).

**Activation vs Shot**: One activation produces N shots. Activation is a round-level event; shots are individual projectiles within that activation.

Firing schedules are **derived behavior** computed from warmup/cooldown, not authored data.

### Combat Event
Represents a combat action occurring at a specific point in time.

Examples:

- weapon fired
- projectile launched
- impact occurred

Combat events should become the canonical interface between combat logic and visual rendering.

### Ship Visual Definition
Represents visualization-only ship data required by renderers.

Responsibilities:

- ship id and display name
- hull geometry
- hardpoint locations
- visual-only metadata

Does not contain:

- warmup
- cooldown
- damage
- combat sequencing
- weapon scheduling rules

### Hardpoint Definition
Represents where a weapon appears on a ship in the renderer.

Responsibilities:

- hardpoint id
- referenced weapon id
- visual label
- visual position
- optional visual type hint

Hardpoints belong to a `ShipVisualDefinition`. They reference weapons by id but do not contain combat timing logic.

### Weapon Visual State
Represents renderer-friendly weapon state for a round.

Supported states:

- Charging
- Firing

There is no Idle state. Weapon visual states are derived from combat output upstream of the renderer.

---

## Package Responsibilities

### ship-model
Contains:

- Ship definitions
- Weapon definitions
- Type definitions
- Validation logic

No UI code.

No animation code.

---

### combat-model
Contains:

- Firing pattern derivation from warmup/cooldown/shots
- Combat timeline generation
- Combat event generation

**Firing Algorithm** (corrected after domain realignment):
```
firstRound = warmup || 1  // warmup is the round number, not a delay
weaponFires = (round === firstRound) || ((round - firstRound) % cooldown === 0)
```

**Note**: Previous implementation had a bug (`firstRound = 1 + warmup`). This has been corrected to match STFC semantics.

Example:

Input:

- Ship (with weapon warmup/cooldown/shots)
- Round number

Output:

- CombatEvent[]

No UI code.

No animation code.

**Principle**: Combat model derives firing patterns from source data (warmup/cooldown). Manual firing schedules are not authored.

---

### asset-library
Contains:

- Ship images
- Visual assets
- Effect definitions
- Asset metadata

No business logic.

---

### visualization-model
Contains:

- CombatEvent[] to VisualEvent[] transformation
- ShipVisualDefinition type definitions
- HardpointDefinition type definitions
- WeaponVisualState type definitions
- Round-level visual state derivation

No UI code.

No rendering code.

No DOM, Canvas, or React dependencies.

**Principle**: Visualization-model converts combat output into renderer-friendly presentation data. Renderers consume visual definitions and visual states without understanding warmup/cooldown rules.

---

## Application Responsibilities

### ship-animator
Consumes:

- ship-model
- combat-model
- asset-library

Responsible for:

- playback controls
- animation rendering
- timeline display
- visual effects

The ship-animator must not implement combat calculations internally.

It must render events generated by combat-model.

---

## Architectural Constraints

### Constraint 1
Never place ship-specific combat behavior inside UI components.

Bad:

If ship is Augur, fire Obliterator on round 2.

Good:

Ask combat-model for round events and render them.

---

### Constraint 2
Shared packages should remain framework-agnostic.

Avoid coupling domain packages to React, Vue, or specific UI technologies.

---

### Constraint 3
Prefer event-driven models.

Future applications should consume combat events rather than reimplement combat logic.

---

## Initial Scope
The first milestone is not a combat simulator.

The first milestone is a visual firing-pattern animator.

The system should be designed so that future combat simulations can be built on top of the same event model.
