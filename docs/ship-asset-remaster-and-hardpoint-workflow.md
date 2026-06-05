# STFC Ship Asset Workflow

## Purpose

- Generate presentation-quality ship assets.
- Preserve ship identity.
- Support combat visualization.
- Support future hardpoint calibration and animation.

## Source Image Workflow

```text
STFC ship page
    ->
Extract image from assets.stfc.space
    ->
Preserve original source image
    ->
Create remastered presentation asset
    ->
Interpret weapon hardpoints
    ->
Calibrate coordinates
    ->
Integrate into visualizer
```

- Extract from assets.stfc.space via the ship page asset references.
- Treat source images as authoritative reference material.
- Remasters are derived presentation assets, not new canonical sources.

# STFC Presentation Remaster v2

## Preserve

- Exact silhouette.
- Major negative-space geometry.
- Wing cutouts.
- Structural voids.
- Major weapon-bearing structures.
- Faction identity.
- Recognizable ship profile.

## Enhance

- Materials.
- Paneling.
- Surface wear.
- Lighting.
- Presentation quality.
- Readability.

## Forbidden

- Changing silhouette.
- Filling major cutouts.
- Adding structures.
- Inventing nacelles.
- Thickening support structures.
- Converting ships into generic faction archetypes.

## Orientation Standard

Canonical orientation:

- Nose points lower-right.
- Rear/engines point upper-left.

Purpose:

- Consistent fleet presentation.
- Easier ship-vs-ship visualization.
- Consistent hardpoint interpretation.

## Background Standard

Fleet presentation background characteristics:

- Near-black.
- Warm gunmetal tint.
- Subtle brown undertones.
- Very light haze.
- Minimal visual distraction.

Avoid:

- White backgrounds.
- Checkerboard transparency.
- Bright nebulae.
- Visible stars.
- Large gradients.
- Wallpaper-style scenes.

Purpose:

- Presentation backdrop.
- Not a space scene.

## Hull Marking Policy

- Do not invent readable hull text.
- Do not invent registries.
- Do not invent serial numbers.
- Preserve known markings only when the source is clear, text is known, and placement is known.

If uncertain:

- Prefer no readable text.

Note:

- Realta refinement: keep known ship name text when desired, remove invented markings.

# Hardpoint Interpretation Workflow

## Step 1: Read STFC Weapon Boxes

Determine:

- Weapon count.
- Weapon type.
- Identical vs unique weapons.

## Step 2: Analyze Ship Geometry

Identify:

- Structural landmarks.
- Firing arcs.
- Plausible weapon locations.

## Step 3: Assign Hardpoints

Rules:

- Each STFC weapon box maps to one physical hardpoint.
- Identical weapons imply symmetry unless strong contrary evidence exists.
- Singular weapons prefer centerline placement.
- Hardpoints should align to visible ship structures.
- Avoid placing hardpoints on empty hull plating.

## Step 4: Create Mechanical Interpretation

Include:

- Weapon designation.
- Physical location.
- Visual landmark.
- Engineering rationale.

Purpose:

- Support animation.
- Support future visualization work.

## Step 5: Create Animation Interpretation

Define:

- Firing origin.
- Beam/projectile behavior.
- Visual sequencing.

Do this before coordinate calibration.

# Lessons Learned

## Hardpoint Interpretation Before Calibration

Do not start with coordinates. First:

1. Understand ship geometry.
2. Understand weapon layout.
3. Define physical hardpoints.

Then calibrate.

## Visual Landmarks Matter

Weapon locations should align to:

- Visible structures.
- Emitters.
- Pods.
- Launcher regions.

Not geometric centering.

## Symmetry Is Powerful

Identical STFC weapon boxes strongly imply:

- Left/right symmetry.

Unless strong contrary evidence exists.

## Ship Identity Is Silhouette

The most important element of a remaster is:

- Silhouette.
- Negative-space geometry.
- Major structural profile.

Not surface detail.

## Image-to-Image Preferred

When source images are available, prefer:

1. Source image.
2. Remaster.

Over:

1. Source image.
2. Text description.
3. Recreation.

## More Ships Is Not The Current Bottleneck

Current project bottleneck is:

- Combat presentation.

Not ship count or remastering workflow.

# Current Status

Integrated ships:

- Augur.
- Kelvin.
- Vengeance.

Hardpoint workflow validated on:

- Augur.
- Kelvin.
- Vengeance.
- Pilum.
- Kos'karii.
- Realta.

Remaster workflow validated on:

- Augur.
- Kelvin.
- Vengeance.
- Pilum.
- Kos'karii.
- Realta.

Ship onboarding currently paused.

# Next Priority

Focus on combat presentation using existing integrated ships. Priority order:

1. Weapon firing visuals.
2. Muzzle flashes.
3. Projectile trails.
4. Beam effects.
5. Impact effects.
6. Recoil.
7. Camera presentation.

Do not prioritize adding more ships until visual fidelity questions are answered.
