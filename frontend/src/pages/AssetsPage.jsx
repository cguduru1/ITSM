import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AssetsDashboard from '../components/AssetsDashboard';
import AssetsList from '../components/AssetsList';
import AssetsCharts from '../components/AssetsCharts';
import '../styles/assets.css';
import { useAuth } from '../auth/AuthContext';

export default function AssetsPage({ user }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth() ?? { user: null };
  const isAdmin = !!authUser?.isAdmin;

  const { state } = useLocation();
  const initialFilter = state?.filter ?? null;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalFilter, setGlobalFilter] = useState(initialFilter);

  return (
    <div className="page-container" style={{ width: '100%', margin: 0 }}>

      {/* HEADER */}
      <header className="assets-header">
        <div className="assets-title">
          {/* <div className="app-root">
      <img src="/s3-logo.png" alt="S3 Technologies" className="header-logo" />
      </div> */}
          <h1>Assets</h1>
          <p className="subtitle">Inventory, health, and lifecycle management</p>
        </div>

        <div className="assets-controls">
          <div className="tablist" role="tablist" aria-label="Assets tabs">
            <button
              role="tab"
              aria-selected={activeTab === 'dashboard'}
              className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'lists'}
              className={`tab ${activeTab === 'lists' ? 'active' : ''}`}
              onClick={() => setActiveTab('lists')}
            >
              Lists
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'charts'}
              className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              Charts
            </button>
          </div>

          <div className="controls-right">
            <label className="search">
              <span className="sr-only">Search assets</span>
              <input
                type="search"
                placeholder="Search assets, tag, owner..."
                aria-label="Search assets"
                onChange={(e) => setGlobalFilter({ q: e.target.value })}
              />
            </label>

            <button
              className="btn primary"
              onClick={() => navigate('/assets/new')}
              aria-label="Add asset"
            >
              + Add Asset
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="assets-main">
        {activeTab === 'dashboard' && (
          <AssetsDashboard onTileNavigate={(target, filter) => setGlobalFilter(filter)} />
        )}

        {activeTab === 'lists' && (
          <AssetsList filter={globalFilter} user={user} />
        )}

        {activeTab === 'charts' && (
          <AssetsCharts filter={globalFilter || ""} user={user} />
        )}
      </main>

    </div>
  );
}
