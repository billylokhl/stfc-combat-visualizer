# STFC Combat Visualizer

A modern combat visualizer for Star Trek Fleet Command (STFC) that transforms complex ship data into engaging, intuitive, and highly visual experiences.

## Overview

This monorepo contains shared domain models and applications for visualizing STFC ship data, combat mechanics, and progression paths.

## Philosophy

- **Visual First**: Show rather than tell through animations, timelines, and interactive visualizations
- **Substance Before Decoration**: Visuals must communicate meaningful game mechanics
- **Modular Growth**: Collection of focused applications sharing common foundations
- **Separation of Concerns**: Business logic independent from presentation

## Repository Structure

```
stfc-combat-visualizer/
├── docs/                    # Platform documentation
│   ├── vision.md           # Product vision and philosophy
│   └── architecture.md     # Technical architecture
├── packages/               # Shared domain packages
│   ├── ship-model/        # Ship definitions and metadata
│   ├── combat-model/      # Combat mechanics and event generation
│   └── asset-library/     # Visual assets and metadata
└── apps/                   # Applications
    └── ship-animator/     # Ship firing pattern animator
```

## Packages

### ship-model
Framework-agnostic ship definitions, weapon specifications, and type definitions.

### combat-model
Combat timeline generation and event system. Produces structured combat events consumed by visual applications.

### asset-library
Ship images, visual assets, and effect definitions.

## Applications

### ship-animator
Visualizes ship firing patterns, weapon timing, and combat rhythm through animation.

## Development Principles

1. **Business logic lives in packages**, not in UI components
2. **Shared packages remain framework-agnostic**
3. **UI applications consume domain events** rather than implementing combat logic
4. **Start simple**, add complexity only when needed

## Development Prerequisites

- **Node.js:** >= 18.0.0 (check via `node --version`)
- **npm:** included with Node.js
- **Monorepo setup:** This is an npm workspace monorepo. Dependencies are installed at the repository root.

## Getting Started

This repository contains a set of packages and a demo application for visualizing ship firing patterns and combat events.

Local development (quick start):

1. Install dependencies at the repo root:

```bash
npm install
```

2. Start the demo app (ship-animator):

```bash
cd apps/ship-animator
npm install
npm run dev
```

3. Open the local dev server URL shown by Vite (usually http://localhost:5173).

## Documentation

- [Vision Document](docs/vision.md) - Platform mission and product philosophy
- [Architecture Document](docs/architecture.md) - Technical design and constraints

## Status

**Release baseline v0.1.0**: This repository now includes a working visualization pipeline and a public demo deployment. The visualization renderer and demo application are functional and suitable for exploratory use and demonstration purposes. Several domain packages (ship-model, combat-model, visualization-model) contain production-minded type definitions and examples, but some combat timing and provenance data remain under active validation.

## Public Demo

The project is publicly deployed as a GitHub Pages demo:

https://billylokhl.github.io/stfc-combat-visualizer/

See the `apps/ship-animator` demo for examples and interactive visualization controls.

## GitHub Pages Deployment

This repository is configured to publish the demo to GitHub Pages. The published site hosts the `ship-animator` demo and is updated via the repository's CI/CD workflow when changes are pushed to `main`.

If you need to rebuild and preview the static site locally, you can run a production build in the app folder:

```bash
cd apps/ship-animator
npm run build
npx serve dist
```

(Install `serve` globally or via `npm i -g serve`.)

## Contributing Validation Evidence

We welcome contributions with validation evidence, especially battle logs. To submit corrections or improvements:

- **Battle logs:** If you have battle-log evidence, attach it to your contribution with details on how it validates the correction.
- **Verification status:** Only upgrade `verificationStatus` to `verified` if supported by battle-log evidence or authoritative STFC source data (see `docs/data-verification-policy.md`).
- **Provenance:** Document the `provenanceCategory` for all data contributions (see `docs/data-provenance-policy.md`).

## Current Verification Status

- **Visualization:** The visualization system (renderer, playback engine, and demo UI) is functional and renders weapon activations, projectile visuals, and timelines.
- **Combat timing model:** The `combat-model` produces event schedules from weapon warmup/cooldown/shots parameters, but the timing model and some ship data values are still being validated against battle logs and authoritative sources.
- **Provenance & verification:** Catalog entries include `verificationStatus` and `provenanceCategory` indicators in the data packages; consult those fields before treating data as authoritative.

## Verification Disclaimer

This project is a combat visualizer, not a combat simulator. Visual patterns are derived from configured weapon timing parameters and should not be interpreted as verified combat outcomes. Do not promote unverified data to `verified` without supporting evidence (see `docs/data-verification-policy.md`).
