# Ship Animator v0 - Milestone 3 Documentation

## Overview

Ship Animator v0 is the **proof-of-concept frontend application** that validates the complete architecture by implementing a minimal end-to-end ship visualization system. This milestone demonstrates that the layered architecture (domain → visualization → rendering) works in practice with real browser-based animation.

**Status**: ✅ Complete  
**Architecture Validation**: Successful  
**Technology Stack**: React 18 + Vite + Canvas 2D  
**Demo Ship**: Augur (15 combat rounds)

---

## What Was Built

### 1. React Application Structure

```
apps/ship-animator/
├── index.html              # HTML shell with dark theme
├── vite.config.ts          # Vite config with package aliases
├── tsconfig.json           # React/TypeScript config
├── tsconfig.node.json      # Vite-specific config
├── package.json            # React dependencies
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Main application component
    ├── components/
    │   ├── ShipCanvas.tsx        # Canvas wrapper with animation loop
    │   ├── PlaybackControls.tsx  # UI controls (play/pause/speed)
    │   └── TimelineDebug.tsx     # Debug panel with event viewer
    ├── engine/
    │   └── PlaybackEngine.ts     # Wall-clock timing engine
    └── renderer/
        └── CanvasRenderer.ts     # Canvas 2D primitive renderer
```

### 2. Key Components

#### **App.tsx** - Application Root
- Generates visual timelines from Augur's combat events (rounds 1-15)
- Manages playback state (isPlaying, speed, currentTime, currentRound)
- Coordinates data flow between components
- Layout: Header + Canvas/Controls + Debug Panel

#### **ShipCanvas.tsx** - Canvas Wrapper
- Manages PlaybackEngine and CanvasRenderer instances
- Runs requestAnimationFrame loop
- Handles canvas resize
- Props callbacks: onTimeUpdate, onRoundUpdate

#### **PlaybackControls.tsx** - Playback UI
- Play/Pause button (green/red states)
- Restart button
- Speed controls (0.5x, 1x, 2x)
- Round counter display

#### **TimelineDebug.tsx** - Debug Panel
- Shows current round, time, duration, total events
- Active Events section (within 100ms window)
- Upcoming Events section (next 500ms)
- All Round Events list with past/future states

### 3. Core Engine Classes

#### **PlaybackEngine.ts** - Timing System
- **Responsibility**: Manage wall-clock-based playback timing
- **Key Methods**:
  - `play()` - Start/resume playback
  - `pause()` - Pause playback
  - `restart()` - Reset to round 1, time 0
  - `setSpeed(multiplier)` - Change playback speed
  - `getCurrentState()` - Get current state (round, time, active/upcoming events)
- **Timing Model**:
  - Uses `performance.now()` for accurate wall-clock time
  - Handles playback speed multiplier
  - Manages round transitions automatically
  - Active event window: 100ms
  - Upcoming event window: 500ms

#### **CanvasRenderer.ts** - Rendering System
- **Responsibility**: Draw ship and visual effects using Canvas 2D primitives
- **Ship Representation**:
  - Body: Gray rectangle (100x60px)
  - Label: "AUGUR" text
  - Hardpoints: 3 circles with labels (L, R, O)
- **Visual Effects**:
  - **Muzzle Flash**: Radial gradient (yellow/orange)
  - **Recoil**: Red line indicator
  - **Projectile**: Moving yellow dot with trail (200px/s, 2000ms lifetime)
- **Hardpoint Positions**:
  - `left_beam` (L): left side
  - `right_beam` (R): right side
  - `obliterator` (O): center top
- **Rendering Methods**:
  - `render(round, time, activeEvents)` - Main render loop
  - `renderShip()` - Draw ship body
  - `renderHardpoints(activeSet)` - Draw hardpoint markers
  - `renderMuzzleFlash(hardpoint, intensity)` - Flash effect
  - `renderRecoil(hardpoint, intensity)` - Recoil effect
  - `renderProjectiles(time)` - Update and draw projectiles
  - `renderRoundIndicator(round)` - Draw round number

---

## Architecture Validation Results

### ✅ Layer Separation Verified

**Ship Model → Combat Model → Visualization Model → Renderer**

Each layer remains completely isolated:

1. **Ship Model** (`@stfc-vi/ship-model`)
   - Defines Augur with firing schedules
   - No knowledge of combat, visuals, or rendering

2. **Combat Model** (`@stfc-vi/combat-model`)
   - Generates combat events from firing schedules
   - No knowledge of visuals or rendering

3. **Visualization Model** (`@stfc-vi/visualization-model`)
   - Transforms combat events to visual timelines
   - No knowledge of rendering implementation

4. **Renderer** (`CanvasRenderer.ts`)
   - Consumes only `VisualEvent[]`
   - No knowledge of ships, weapons, or combat rules
   - **Critical constraint met**: "The renderer must not understand firing schedules or combat rules"

### ✅ Framework Independence Verified

Domain packages (`ship-model`, `combat-model`, `visualization-model`) have **zero React dependencies**. They are pure TypeScript libraries consumed by the React app through package references.

**This proves the architecture supports multiple frontends**:
- Today: React + Vite app
- Tomorrow: Could be Vue, Svelte, vanilla JS, or server-side rendering
- No changes required to domain packages

### ✅ Package References Working

Vite's path aliases + TypeScript project references work correctly:
- `@stfc-vi/ship-model` → `packages/ship-model/src`
- `@stfc-vi/combat-model` → `packages/combat-model/src`
- `@stfc-vi/visualization-model` → `packages/visualization-model/src`

Hot module replacement (HMR) works across packages during development.

### ✅ Timing Model Validated

Wall-clock timing with `performance.now()`:
- Accurate playback speed control (0.5x, 1x, 2x)
- Smooth round transitions
- Event windows correctly identify active/upcoming events

### ✅ Visual Event Model Validated

The visual event types and timing offsets work in practice:
- **round_marker** - Defines round start
- **recoil** - Appears before muzzle flash (correct physics)
- **muzzle_flash** - Bright flash at firing moment
- **projectile_launch** - Triggers moving projectile
- **impact** - (not yet rendered, but supported)

Timing sequences for multi-shot weapons (left_beam, right_beam) render correctly with visible delays between shots.

---

## How It Works

### Data Flow

```
User Clicks Play
    ↓
PlaybackEngine.play()
    ↓
requestAnimationFrame loop in ShipCanvas
    ↓
PlaybackEngine.getCurrentState()
    → { round, roundTime, active: VisualEvent[], upcoming: VisualEvent[] }
    ↓
CanvasRenderer.render(round, roundTime, active)
    ↓
Canvas 2D primitives drawn
    ↓
onTimeUpdate(time) → App state update
onRoundUpdate(round) → App state update
    ↓
TimelineDebug re-renders with new state
```

### Animation Loop Pattern

```typescript
// ShipCanvas.tsx
const animate = () => {
  const state = engine.getCurrentState();
  
  // Update parent
  onTimeUpdate(state.roundTime);
  onRoundUpdate(state.round);

  // Render
  renderer.render(state.round, state.roundTime, state.active);

  // Continue
  animationFrameRef.current = requestAnimationFrame(animate);
};
```

### Event Rendering Logic

```typescript
// CanvasRenderer.ts
render(round: number, roundTime: number, activeEvents: VisualEvent[]) {
  // 1. Clear canvas
  this.clear();
  
  // 2. Draw ship body
  this.renderShip();
  
  // 3. Draw hardpoints (highlight active ones)
  const activeHardpoints = new Set(activeEvents.map(e => e.hardpoint));
  this.renderHardpoints(activeHardpoints);
  
  // 4. Draw visual effects
  for (const event of activeEvents) {
    const age = roundTime - event.timestamp;
    const intensity = 1 - age / 100; // Fade over 100ms
    
    switch (event.type) {
      case 'muzzle_flash': this.renderMuzzleFlash(...);
      case 'recoil': this.renderRecoil(...);
      case 'projectile_launch': this.launchProjectile(...);
    }
  }
  
  // 5. Draw projectiles (managed separately)
  this.renderProjectiles(roundTime);
  
  // 6. Draw round indicator
  this.renderRoundIndicator(round);
}
```

---

## Running Ship Animator v0

### Development Mode

```bash
cd ~/sandbox/stfc-visual-intelligence
npm install  # Install all workspace dependencies
cd apps/ship-animator
npm run dev  # Start Vite dev server
```

Open: `http://localhost:3000/`

### Production Build

```bash
cd apps/ship-animator
npm run build   # TypeScript compile + Vite bundle
npm run preview # Preview production build
```

### Controls

- **▶ PLAY / ⏸ PAUSE**: Start/stop animation
- **⏮ RESTART**: Reset to round 1
- **Speed buttons**: 0.5x (slow motion), 1x (normal), 2x (fast forward)
- **Round counter**: Shows current round / total rounds

### What You'll See

1. **Canvas Area (left)**: Augur ship with animated firing effects
   - Gray rectangle ship body
   - Three hardpoint circles (L, R, O)
   - Yellow muzzle flashes
   - Red recoil indicators
   - Yellow projectiles with trails

2. **Debug Panel (right)**: Real-time event viewer
   - Current round info (time, duration, event count)
   - Active events (within 100ms)
   - Upcoming events (next 500ms)
   - Full round event timeline

---

## Observations & Lessons

### What Worked Well

1. **Layer isolation is real**: Each package truly knows nothing about the layers above it
2. **Package references are smooth**: Vite HMR works across workspace packages
3. **TypeScript path mapping**: Clean imports with `@stfc-vi/*` aliases
4. **Wall-clock timing**: `performance.now()` provides accurate, smooth animation
5. **Canvas 2D is sufficient**: No need for WebGL for simple geometric rendering
6. **React component split**: Clear separation between canvas (rendering) and controls (UI)

### Constraints Validated

- ✅ "The renderer must consume only VisualEvents"
- ✅ "The renderer must not understand firing schedules"
- ✅ "The renderer must not understand combat rules"
- ✅ "Domain packages must be framework-agnostic"

### Simplicity Wins

The entire renderer is **~280 lines** of simple Canvas 2D code:
- No external rendering libraries
- No sprite sheets or image assets
- No fancy shaders or effects
- Just rectangles, circles, gradients, and lines

**And it works.**

---

## Current Limitations

(Intentional scope limits for v0)

1. **No pause during round**: Pause works, but might feel better with explicit round-end pausing
2. **No seek control**: Can't jump to specific round or time
3. **Fixed canvas size**: No responsive canvas sizing
4. **No impact effects**: Impact visual events are generated but not rendered
5. **Single ship**: Only Augur is configured
6. **No customization UI**: Can't change ship or firing patterns without code changes
7. **No audio**: Visual only

---

## Success Criteria

**From Milestone 3 specification:**

> "When complete, you should be able to:
> 1. Run npm run dev in apps/ship-animator
> 2. See Augur firing its weapons on a canvas
> 3. Use play/pause/speed controls
> 4. Observe that the renderer only consumes VisualEvents"

### ✅ All Criteria Met

1. ✅ `npm run dev` works, server starts on port 3000
2. ✅ Augur visible with animated firing effects (muzzle flashes, recoils, projectiles)
3. ✅ Play/Pause button works, speed controls (0.5x/1x/2x) work, restart works
4. ✅ CanvasRenderer only imports `VisualEvent` type, no combat or ship knowledge

---

## Architecture Proof

The complete system flow demonstrates clean architecture:

```typescript
// 1. Ship definition (domain)
const augur: Ship = {
  name: 'Augur',
  weapons: [
    { id: 'left_beam', hardpoint: 'left_beam', firesEveryRound: { shotsPerRound: 2 } },
    { id: 'right_beam', hardpoint: 'right_beam', firesEveryRound: { shotsPerRound: 2 } },
    { id: 'obliterator', hardpoint: 'obliterator', interval: { every: 3, startRound: 2 } },
  ],
};

// 2. Combat events (domain)
const combatEvents = generateCombatEvents(augur, 15);

// 3. Visual timelines (visualization)
const timelines = transformCombatToVisual(combatEvents, augurHardpoints, augurVisualConfig);

// 4. Rendering (framework-specific)
renderer.render(round, time, activeEvents);  // activeEvents: VisualEvent[]
```

Each layer adds one responsibility, no layer knows about the layers above it, and the framework (React) only appears at the final rendering stage.

**The architecture is validated.**

---

## Next Steps (Future Milestones)

This v0 proves the architecture works. Future milestones could add:

1. **More ships**: Define Mayflower, Enterprise, etc.
2. **Ship selector UI**: Choose which ship to visualize
3. **Firing pattern editor**: Modify weapons and see results
4. **Impact effects**: Render impact visual events
5. **Audio**: Add weapon firing sounds
6. **Custom combat**: Define target ship and show combat resolution
7. **Timeline scrubber**: Seek to specific time/round
8. **Responsive canvas**: Adapt to window size
9. **Performance optimizations**: Object pooling for projectiles, etc.

**But for now, Ship Animator v0 has accomplished its mission: proving the architecture works end-to-end.**

---

## File Manifest

### Created Files

- `apps/ship-animator/index.html` - HTML shell
- `apps/ship-animator/vite.config.ts` - Vite configuration
- `apps/ship-animator/tsconfig.json` - TypeScript configuration
- `apps/ship-animator/tsconfig.node.json` - Vite TypeScript config
- `apps/ship-animator/src/main.tsx` - React entry point
- `apps/ship-animator/src/App.tsx` - Main application component
- `apps/ship-animator/src/components/ShipCanvas.tsx` - Canvas wrapper
- `apps/ship-animator/src/components/PlaybackControls.tsx` - UI controls
- `apps/ship-animator/src/components/TimelineDebug.tsx` - Debug panel
- `apps/ship-animator/src/engine/PlaybackEngine.ts` - Timing engine
- `apps/ship-animator/src/renderer/CanvasRenderer.ts` - Canvas renderer

### Modified Files

- `apps/ship-animator/package.json` - Added React dependencies
- `apps/ship-animator/tsconfig.json` - Updated for React/Vite

---

## Conclusion

Ship Animator v0 is a **minimal but complete** proof that the STFC Visual Intelligence architecture works in practice. It demonstrates:

- Clean layer separation
- Framework-agnosable domain packages
- Real-time animation with Canvas 2D
- Playback controls and debug visualization
- Augur firing weapons with visual effects

The simplicity is intentional. No premature features, no decoration, no complexity.

**Just the architecture working as designed.**

✅ **Milestone 3: Complete**
