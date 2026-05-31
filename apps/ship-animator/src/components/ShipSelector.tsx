import type { ShipCatalogEntry } from '@stfc-vi/visualization-model/examples';

interface ShipSelectorProps {
  ships: ShipCatalogEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ShipSelector({ ships, selectedId, onSelect }: ShipSelectorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label
        htmlFor="ship-select"
        style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}
      >
        Ship:
      </label>
      <select
        id="ship-select"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          background: '#333',
          color: '#e0e0e0',
          border: '1px solid #555',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        {ships.map((ship) => (
          <option key={ship.id} value={ship.id}>
            {ship.name}
          </option>
        ))}
      </select>
    </div>
  );
}
