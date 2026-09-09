// Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const tiles = [
  { id: 'openTickets', label: 'Open Tickets', value: '128', target: '/tickets', filter: { status: 'open' }, color: 'cyan', icon: '⚡' },
  { id: 'activeAssets', label: 'Active Assets', value: '3421', target: '/assets', filter: null, color: 'purple', icon: '💎' },
  { id: 'pendingChanges', label: 'Pending Changes', value: '19', target: '/changes', filter: { status: 'pending' }, color: 'pink', icon: '🔧' },
  { id: 'ciHealth', label: 'CI Health Score', value: '92%', target: '/cmdb', filter: null, color: 'green', icon: '🧬' },
  { id: 'kbSuccess', label: 'KB Search Success', value: '87%', target: '/kb', filter: null, color: 'blue', icon: '📡' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  function handleTileActivate(tile) {
    // Pass filter via router state
    navigate(tile.target, { state: { filter: tile.filter } });
  }

  return (
    <section className="dashboard" aria-label="Dashboard tiles">
      <h1 className="sr-only">Dashboard</h1>
      <div className="tiles-grid">
        {tiles.map(tile => (
          <div
            key={tile.id}
            role="button"
            tabIndex="0"
            className={`tile tile-${tile.color}`}
            aria-label={`${tile.label} ${tile.value}`}
            onClick={() => handleTileActivate(tile)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTileActivate(tile);
              }
            }}
          >
            <div className="tile-icon" aria-hidden="true">{tile.icon}</div>
            <div className="tile-body">
              <div className="tile-label">{tile.label}</div>
              <div className="tile-value" aria-live="polite">{tile.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
