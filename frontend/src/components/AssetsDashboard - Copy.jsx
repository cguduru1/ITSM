import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/apiClient";

// 1. Declare helper outside component scope to avoid scope issues
const formatValue = (val) => {
  if (typeof val === "number") return val;
  return val || "0";
};

/**
 * KPI tiles. Clicking a tile navigates to /assets (lists) with filter state.
 * Replace icons and values with live data from your API.
 */
export default function AssetsDashboard({ onTileNavigate }) {
  const navigate = useNavigate();
 const [stats, setStats] = useState({
    activeAssets: 0,
    openTickets: 0,
    pendingChanges: 0,
    ciHealth: "0%",
    kbSuccess: "0%",
  });

  useEffect(() => {
    let isMounted = true;
  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/dashboard/stats");
      const data = res?.data ?? res;
      console.log("Fetched stats:", data);
      if (data && isMounted) {
      setStats({
          activeAssets: data.activeAssets ?? 0,
          openTickets: data.openTickets ?? 0,
          pendingChanges: data.pendingChanges ?? 0,
          ciHealth: data.ciHealth ?? "0%",
          kbSuccess: data.kbSuccess ?? "0%",
        });
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }
  fetchStats();
}, []);

  // const tiles = [
  //   { id: 'total', label: 'Active Assets', value: '3421', color: 'purple', target: '/assets', filter: null, icon: '💎' },
  //   { id: 'ciHealth', label: 'CI Health Score', value: '92%', color: 'green', target: '/cmdb', filter: null, icon: '🧬' },
  //   { id: 'pending', label: 'Pending Changes', value: '19', color: 'pink', target: '/changes', filter: { status: 'pending' }, icon: '🔧' },
  //   { id: 'openTickets', label: 'Open Tickets', value: '128', color: 'cyan', target: '/tickets', filter: { status: 'New' }, icon: '⚡' },
  //   { id: 'kbSuccess', label: 'KB Search Success', value: '87%', color: 'blue', target: '/kb', filter: null, icon: '📡' },
  // ];

  const tiles = [
  { id: 'total', label: 'Active Assets', value: stats.activeAssets, color: 'purple', target: '/assets', icon: '💎' },
  { id: 'ciHealth', label: 'CI Health Score', value: typeof stats.ciHealth === 'number' && stats.ciHealth > 0 ? `${stats.ciHealth}%` : stats.ciHealth, color: 'green', target: '/cmdb', icon: '🧬' },
  { id: 'pending', label: 'Pending Changes', value: stats.pendingChanges, color: 'pink', target: '/changes', filter: { status: 'pending' }, icon: '🔧' },
  { id: 'openTickets', label: 'Open Tickets', value: stats?.openTickets ?? 0, color: 'cyan', target: '/tickets', icon: '⚡' },
  { id: 'kbSuccess', label: 'KB Search Success', value: stats?.kbSuccess ?? "0%", color: 'blue', target: '/kb', icon: '📡' },
];


  function activate(tile) {
    // If target is assets, set filter and switch to lists via parent callback
    if (tile.target === '/assets') {
      onTileNavigate(tile.target, tile.filter);
      navigate('/assets', { state: { filter: tile.filter } });
    } else {
      // navigate to other modules
      navigate(tile.target, { state: { filter: tile.filter } });
    }
  }

  return (
    <section className="assets-dashboard" aria-label="Assets dashboard">
      <div className="tiles-grid">
        {tiles.map(t => (
          <div
            key={t.id}
            role="button"
            tabIndex="0"
            className={`kpi-tile tile-${t.color}`}
            aria-label={`${t.label} ${t.value}`}
            onClick={() => activate(t)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') activate(t); }}
          >
            <div className="tile-left">
              <div className="tile-icon" aria-hidden="true">{t.icon}</div>
            </div>
            <div className="tile-right">
              <div className="tile-label">{t.label}</div>
              <div className="tile-value">{t.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <button className="btn" onClick={() => navigate('/assets/new')}>New Asset</button>
        <button className="btn" onClick={() => navigate('/assets/import')}>Import CSV</button>
        <button className="btn" onClick={() => navigate('/assets/export')}>Export</button>
      </div>
    </section>
  );
}
