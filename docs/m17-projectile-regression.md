M17 Projectile Rendering Status

Summary
-------
This document records the deliberate visual regression introduced by Milestone 17
(Shared Combat Scene Foundation) regarding projectile visuals.

Previous state
--------------
- The single-ship `CanvasRenderer` rendered projectile visuals for `projectile_launch`
  events. Projectiles were represented as moving dots with a short trail in the
  ship-local canvas coordinate system (`launchProjectile` + `renderProjectiles`).

Current state (M17)
-------------------
- The shared scene (`CombatSceneRenderer`) intentionally renders `muzzle_flash`
  and `recoil` visual events but does not render `projectile_launch` events.
- `projectile_launch` events are currently ignored by the shared renderer.

Reason
------
- Cross-ship projectile architecture (visual travel from attacker to defender)
  was scoped to Milestone 18. To avoid prematurely implementing a target/trajectory
  model before design completion, projectile travel was deferred.

Status
------
- Documented known regression: projectile visuals are not shown in the shared
  scene.
- This is an accepted and tracked regression for the purpose of enabling
  the shared scene foundation (M17).

Next steps
----------
- Milestone 18 will implement cross-ship projectile visualization (scene-level
  projectiles, origin/target anchors, travel paths, arrival handling).
- Until M18, reviewers and users should consider projectile visuals absent by
  design in the shared scene mode.

Notes
-----
- The original `CanvasRenderer` still contains projectile logic and remains in
  the repository for reference; however M17 removed its active usage in the
  `App` integration. If future work reintroduces single-ship viewers, that
  logic may be reused or ported to the scene renderer.
