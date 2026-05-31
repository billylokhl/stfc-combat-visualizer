# STFC Visual Intelligence

A modern visual intelligence platform for Star Trek Fleet Command (STFC) that transforms complex ship data into engaging, intuitive, and highly visual experiences.

## Overview

This monorepo contains shared domain models and applications for visualizing STFC ship data, combat mechanics, and progression paths.

## Philosophy

- **Visual First**: Show rather than tell through animations, timelines, and interactive visualizations
- **Substance Before Decoration**: Visuals must communicate meaningful game mechanics
- **Modular Growth**: Collection of focused applications sharing common foundations
- **Separation of Concerns**: Business logic independent from presentation

## Repository Structure

```
stfc-visual-intelligence/
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

## Getting Started

This repository is currently in bootstrap phase. Package scaffolding and placeholder interfaces have been created.

## Documentation

- [Vision Document](docs/vision.md) - Platform mission and product philosophy
- [Architecture Document](docs/architecture.md) - Technical design and constraints

## Status

**Bootstrap Phase**: Initial repository structure and documentation established. Domain models and applications are placeholders awaiting implementation.
