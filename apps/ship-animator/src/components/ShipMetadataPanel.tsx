import type { ShipCatalogEntry, VerificationStatus, ProvenanceCategory } from '@stfc-vi/visualization-model/examples';

interface ShipMetadataPanelProps {
  entry: ShipCatalogEntry;
  defender?: ShipCatalogEntry;
}

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified: 'Verified',
  unverified: 'Unverified',
  placeholder: 'Placeholder',
};

const VERIFICATION_COLORS: Record<VerificationStatus, string> = {
  verified: '#4caf50',
  unverified: '#ff9800',
  placeholder: '#9e9e9e',
};

const PROVENANCE_LABELS: Record<ProvenanceCategory, string> = {
  battle_log: 'Battle Log',
  source_extract: 'Source Extract',
  derived: 'Derived',
  approximation: 'Approximation',
  placeholder: 'Placeholder',
  unknown: 'Unknown',
};

const PROVENANCE_COLORS: Record<ProvenanceCategory, string> = {
  battle_log: '#4caf50',
  source_extract: '#2196f3',
  derived: '#03a9f4',
  approximation: '#ff9800',
  placeholder: '#9e9e9e',
  unknown: '#f44336',
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '3px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.03em',
      background: `${color}22`,
      color: color,
      border: `1px solid ${color}55`,
    }}>
      {label}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '10px', color: '#777', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function ShipMetadataPanel({ entry, defender }: ShipMetadataPanelProps) {
  const weaponCount = entry.ship?.weapons?.length ?? 0;
  const hardpoints = entry.visual?.hardpoints ?? [];

  // Resolve visual origins per weapon:
  // A weapon has a visual origin if either:
  // 1) a hardpoint exists where hardpoint.weaponId === weapon.id
  // OR
  // 2) a hardpoint exists where hardpoint.id === weapon.hardpoint
  const resolvedWeaponIds = new Set<string>();
  const resolvedHardpointIds = new Set<string>();
  if (entry.ship?.weapons) {
    for (const w of entry.ship.weapons) {
      const matches = hardpoints.filter(hp => hp?.weaponId === w.id || hp?.id === w.hardpoint);
      if (matches.length > 0) {
        resolvedWeaponIds.add(w.id);
        for (const m of matches) {
          if (m?.id) resolvedHardpointIds.add(m.id);
        }
      }
    }
  }

  const resolvedWeaponCount = resolvedWeaponIds.size;
  const uniqueResolvedHardpointCount = resolvedHardpointIds.size;
  const coverageIncomplete = weaponCount > 0 && resolvedWeaponCount < weaponCount;

  return (
    <div style={{
      padding: '12px 16px',
      background: '#1a1a1a',
      borderTop: '1px solid #333',
      fontSize: '13px',
      color: '#ccc',
    }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 220 }}>
          <Row label="Attacker">
            <span style={{ fontWeight: 600, color: '#e0e0e0' }}>{entry.name}</span>
          </Row>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <Row label="Verification">
              <Badge
                label={VERIFICATION_LABELS[entry.verificationStatus]}
                color={VERIFICATION_COLORS[entry.verificationStatus]}
              />
            </Row>

            <Row label="Provenance">
              <Badge
                label={PROVENANCE_LABELS[entry.provenanceCategory]}
                color={PROVENANCE_COLORS[entry.provenanceCategory]}
              />
            </Row>
          </div>

          {weaponCount > 0 && (
            <Row label="Visual Origins">
              <span style={{ color: coverageIncomplete ? '#ff9800' : '#4caf50' }}>
                {resolvedWeaponCount} / {weaponCount} weapons have visual origins
              </span>
            </Row>
          )}

          {coverageIncomplete && (
            <div style={{
              marginBottom: '10px',
              padding: '8px 10px',
              background: '#ff980018',
              border: '1px solid #ff980055',
              borderRadius: '3px',
              fontSize: '11px',
              color: '#ff9800',
              lineHeight: '1.5',
            }}>
              Visualization configuration is incomplete. {resolvedWeaponCount} of {weaponCount} weapons have visual origins.
            </div>
          )}

          {!coverageIncomplete && weaponCount > 0 && uniqueResolvedHardpointCount < weaponCount && (
            <div style={{
              marginBottom: '10px',
              padding: '8px 10px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '3px',
              fontSize: '11px',
              color: '#90caf9',
              lineHeight: '1.5',
            }}>
              Multiple weapons share visual origins. Projectile paths may overlap until ship-specific hardpoints are refined.
            </div>
          )}

          {weaponCount > uniqueResolvedHardpointCount && (
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              {weaponCount} weapons share {uniqueResolvedHardpointCount} hardpoint(s)
            </div>
          )}

          {entry.notes && (
            <Row label="Notes">
              <span style={{ fontSize: '11px', color: '#888', lineHeight: '1.5' }}>
                {entry.notes}
              </span>
            </Row>
          )}
        </div>

        {defender && (
          <div style={{ minWidth: 220 }}>
            <Row label="Defender">
              <span style={{ fontWeight: 600, color: '#e0e0e0' }}>{defender.name}</span>
            </Row>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <Row label="Verification">
                <Badge
                  label={VERIFICATION_LABELS[defender.verificationStatus]}
                  color={VERIFICATION_COLORS[defender.verificationStatus]}
                />
              </Row>

              <Row label="Provenance">
                <Badge
                  label={PROVENANCE_LABELS[defender.provenanceCategory]}
                  color={PROVENANCE_COLORS[defender.provenanceCategory]}
                />
              </Row>
            </div>

            {(() => {
              const wCount = defender.ship?.weapons?.length ?? 0;
              const hps = defender.visual?.hardpoints ?? [];

              const resolvedW = new Set<string>();
              const resolvedHP = new Set<string>();
              if (defender.ship?.weapons) {
                for (const w of defender.ship.weapons) {
                  const matches = hps.filter(hp => hp?.weaponId === w.id || hp?.id === w.hardpoint);
                  if (matches.length > 0) {
                    resolvedW.add(w.id);
                    for (const m of matches) if (m?.id) resolvedHP.add(m.id);
                  }
                }
              }

              const resolvedCount = resolvedW.size;
              const uniqueHPCount = resolvedHP.size;
              const incomplete = wCount > 0 && resolvedCount < wCount;

              return (
                <>
                  {wCount > 0 && (
                    <Row label="Visual Origins">
                      <span style={{ color: incomplete ? '#ff9800' : '#4caf50' }}>
                        {resolvedCount} / {wCount} weapons have visual origins
                      </span>
                    </Row>
                  )}

                  {incomplete && (
                    <div style={{
                      marginBottom: '10px',
                      padding: '8px 10px',
                      background: '#ff980018',
                      border: '1px solid #ff980055',
                      borderRadius: '3px',
                      fontSize: '11px',
                      color: '#ff9800',
                      lineHeight: '1.5',
                    }}>
                      Visualization configuration is incomplete. {resolvedCount} of {wCount} weapons have visual origins.
                    </div>
                  )}

                  {!incomplete && wCount > 0 && uniqueHPCount < wCount && (
                    <div style={{
                      marginBottom: '10px',
                      padding: '8px 10px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '3px',
                      fontSize: '11px',
                      color: '#90caf9',
                      lineHeight: '1.5',
                    }}>
                      Multiple weapons share visual origins. Projectile paths may overlap until ship-specific hardpoints are refined.
                    </div>
                  )}

                  {wCount > uniqueHPCount && (
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                      {wCount} weapons share {uniqueHPCount} hardpoint(s)
                    </div>
                  )}

                  {defender.notes && (
                    <Row label="Notes">
                      <span style={{ fontSize: '11px', color: '#888', lineHeight: '1.5' }}>
                        {defender.notes}
                      </span>
                    </Row>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
