# Data Verification Policy

## Purpose

Ship data in the catalog represents timing values and weapon configurations critical for accurate visualizations. This policy establishes verification status tracking to prevent approximate or placeholder data from being treated as canonical.

## Verification Status Values

The `verificationStatus` field on `ShipCatalogEntry` must be one of:

- **`verified`**: Data confirmed against battle logs or authoritative STFC source data
- **`unverified`**: Data present but not validated against evidence (approximations, estimates, community references)
- **`placeholder`**: Minimal data for structural validation only (incomplete definitions)

## Verification Criteria

### Verified Status
To qualify as `verified`, ship data must:
- Have weapon timing (warmup/cooldown/shots) confirmed against battle logs or official STFC data sources
- Document the evidence source in commit messages or file comments
- Be reproducible by independent verification

### Unverified Status
`unverified` applies when:
- Timing values are approximations derived from testing without battle log confirmation
- Data is sourced from community references without primary evidence
- Values are estimates intended for visualization testing

### Placeholder Status
`placeholder` applies when:
- Ship entry exists for structural validation but lacks complete weapon definitions
- Data is intentionally minimal to test catalog architecture

## Treatment of Unverified Data

**No ship definition should be treated as canonical solely because it exists in the catalog.**

Unverified data may be used for:
- Visualization testing and development
- Demonstrating catalog capabilities
- Identifying gaps requiring battle log analysis

Unverified data must not be used for:
- Production accuracy claims
- Authoritative timing references
- Community documentation without explicit verification status disclosure

## Upgrading Status

To upgrade a ship from `unverified` to `verified`:
1. Obtain battle logs or official STFC data confirming weapon timing
2. Document evidence in file comments or linked references
3. Update `verificationStatus` field in catalog entry
4. Update `notes` field to reference verification source
5. Commit with clear explanation of verification basis

## Catalog Rules

1. All catalog entries must have an explicit `verificationStatus` field
2. New ships default to `unverified` unless evidence accompanies the addition
3. Placeholders are acceptable for testing but must be clearly marked
4. Verification status must be visible in catalog demos and tooling
5. Approximate data must document assumptions in file headers and catalog notes

## Current Status (as of M11)

All ships currently in the catalog are `unverified`:
- **Augur**: Timing derived from testing but not battle-log verified
- **Vengeance**: Approximations from earlier analysis
- **Kelvin**: Approximations for catalog validation

No ships are currently `verified`. Battle log analysis is required to upgrade any ship to verified status.
