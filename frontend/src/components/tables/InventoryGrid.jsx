import React from 'react';
import { Plus, Minus, RefreshCw } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const InventoryGrid = ({
  inventory = [],
  onChangeUnits,
  editable = false,
  lastUpdated,
}) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
          Blood Component: <strong>Whole Blood (Tested & Stored)</strong>
        </span>
        {lastUpdated && (
          <span
            style={{
              fontSize: '0.78rem',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RefreshCw size={12} /> Last Verified: {formatDateTime(lastUpdated)}
          </span>
        )}
      </div>

      <div className="inventory-grid">
        {inventory.map((item) => {
          const isLowStock = item.unitsAvailable <= 2;
          const isOutOfStock = item.unitsAvailable === 0;

          return (
            <div
              key={item.bloodGroup}
              className="inventory-slot"
              style={{
                borderColor: isOutOfStock
                  ? '#fca5a5'
                  : isLowStock
                  ? '#fcd34d'
                  : '#e2e8f0',
                background: isOutOfStock
                  ? '#fff5f5'
                  : isLowStock
                  ? '#fffbeb'
                  : '#f8fafc',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: isOutOfStock ? '#dc2626' : '#0f1e36',
                  marginBottom: 4,
                }}
              >
                {item.bloodGroup}
              </div>

              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: isOutOfStock
                    ? '#991b1b'
                    : isLowStock
                    ? '#b45309'
                    : '#047857',
                }}
              >
                {item.unitsAvailable}
                <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: 3 }}>
                  units
                </span>
              </div>

              {editable && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onChangeUnits(item.bloodGroup, Math.max(0, item.unitsAvailable - 1))
                    }
                    className="btn btn-outline btn-sm"
                    style={{ padding: '3px 8px', borderRadius: 4 }}
                    title="Decrease unit"
                  >
                    <Minus size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeUnits(item.bloodGroup, item.unitsAvailable + 1)
                    }
                    className="btn btn-primary btn-sm"
                    style={{ padding: '3px 8px', borderRadius: 4 }}
                    title="Increase unit"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}

              <div
                style={{
                  fontSize: '0.7rem',
                  marginTop: 6,
                  color: isOutOfStock
                    ? '#dc2626'
                    : isLowStock
                    ? '#d97706'
                    : '#059669',
                  fontWeight: 600,
                }}
              >
                {isOutOfStock
                  ? 'Depleted'
                  : isLowStock
                  ? 'Low Reserve'
                  : 'Sufficient'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryGrid;
