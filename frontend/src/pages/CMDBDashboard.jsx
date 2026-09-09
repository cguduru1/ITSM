// src/pages/CMDBDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

import CMDBSummaryTiles from "../components/cmdb/CMDBSummaryTiles";
import CMDBAnalyticsPanel from "../components/cmdb/CMDBAnalyticsPanel";
import CMDBCharts from "../components/cmdb/CMDBCharts";
import CMDBServiceMap from "../components/cmdb/CMDBServiceMap";

import "../styles/cmdb.css";  

export default function CMDBDashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({ byType: [], byEnv: [] });
  const [cis, setCis] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load stats 
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);
      try {
        setLoading(true);
        const [statsRes, analyticsRes, cmdbRes] = await Promise.allSettled([
          apiClient.get("/api/cmdb/stats"),
          apiClient.get("/api/cmdb/analytics"),
          apiClient.get("/api/cmdb"),
        ]);
        if (statsRes.status === "fulfilled") {
          const statsData = statsRes.value?.data ?? statsRes.value;
          setStats(statsData);
        }

        // Process Analytics response
        if (analyticsRes.status === "fulfilled") {
          const analyticsData = analyticsRes.value?.data ?? analyticsRes.value;
          setAnalytics(analyticsData);
        }

        // Process CMDB items response
        if (cmdbRes.status === "fulfilled") {
          const rawCmdb = cmdbRes.value?.data ?? cmdbRes.value;
          const list = Array.isArray(rawCmdb)
            ? rawCmdb
            : rawCmdb?.items || rawCmdb?.data || rawCmdb?.cis || [];
          setCis(list);
        }
        // const data = res?.data || res || {};
        // setCis(Array.isArray(data.cis) ? data.cis : []);
        // setCis([]);
      } catch (err) {
        console.error("Failed to load CMDB dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // // Load analytics
  useEffect(() => {
    apiClient.get("/api/cmdb/analytics").then(res => setAnalytics(res.data));
  }, []);

  // Load CI list
  useEffect(() => {
    apiClient.get("/api/cmdb").then(res => setCis(res.data));
  }, []);

  return (
    <div className="cmdb-root quantum-surface">

      {/* Quantum Header */}
    <header className="cmdb-header quantum-header">
      <h1 className="quantum-title">🌌 CMDB Quantum Dashboard</h1>
      
      <p className="quantum-subtitle">
        Enterprise configuration intelligence for your IT landscape
      </p>
    </header>

    {loading ? (
        <p style={{ padding: "16px" }}>Loading configuration metrics...</p>
      ) : (
        <>
      {/* Main Quantum Grid */}
    <div className="cmdb-grid quantum-grid cmdb-actions-grid">

      {/* Core CMDB Pages */}
  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/cmdb")}>
    <span className="icon">📦</span>
    <span className="tile-label">CMDB Explorer</span>
  </div>

  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/cmdb/new")}>
    <span className="icon">➕</span>
    <span className="tile-label">Add CI</span>
  </div>

  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/cmdb-chatbot")}>
    <span className="icon">🤖</span>
    <span className="tile-label">AI Assistant</span>
  </div>

  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/cmdb-integration")}>
    <span className="icon">🔗</span>
    <span className="tile-label">Integrations</span>
  </div>

  {/* Analytics & Visualizations */}
  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/cmdb-charts")}>
    <span className="icon">📊</span>
    <span className="tile-label">Charts</span>
  </div>

  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/cmdb-heatmap")}>
    <span className="icon">🔥</span>
    <span className="tile-label">Heatmap</span>
  </div>

  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/cmdb-impact")}>
    <span className="icon">⚡</span>
    <span className="tile-label">Impact Analysis</span>
  </div>

  {/* Relationships */}
  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/cmdb-relationships")}>
    <span className="icon">🕸</span>
    <span className="tile-label">Relationships</span>
  </div>

  {/* Lifecycle & Health */}
  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/asset-lifecycle")}>
    <span className="icon">🔄</span>
    <span className="tile-label">Asset Lifecycle</span>
  </div>

  {/* <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/cmdb-health")}>
    <span className="icon">❤️</span>
    <span className="tile-label">Health</span>
  </div> */}

  {/* Admin */}
  <div className="cmdb-action-item quantum-tile" onClick={() => navigate("/admin/cmdb-permissions")}>
    <span className="icon">🛡️</span>
    <span className="tile-label">Permissions Admin</span>
  </div>
    </div>

      {/* Main Quantum Grid */}
    <div className="cmdb-grid quantum-grid">

      <section className="quantum-panel">
        <CMDBSummaryTiles analytics={analytics} totalCount={cis.length} />
      </section>

      <section className="quantum-panel">
        <CMDBAnalyticsPanel analytics={analytics} />
      </section>

      <section className="quantum-panel">
        <CMDBCharts analytics={analytics}/>
      </section>

      <section className="quantum-panel">
        <CMDBServiceMap />
      </section>

    </div>

    {/* Secondary Quantum Grid */}
    <div className="cmdb-grid quantum-grid">

       {/* Total CIs */}
        <section className="quantum-panel">
          <h2 className="quantum-heading">Total CIs</h2>
          <div className="quantum-actions">
            <div 
              className="cmdb-btn quantum-btn" 
              style={{ fontSize: "20px", fontWeight: "600" }}
            >
              {cis?.length || 0}
            </div>
          </div>
        </section>

      {/* Actions */}
      <div className="cmdb-panel quantum">
        <h2 className="quantum-heading">Actions</h2>

        <section className="quantum-panel">
            <h2 className="quantum-heading">Actions</h2>
            <div className="quantum-actions">
              <a href="/cmdb" className="cmdb-btn quantum-btn">View All</a>
              <a href="/cmdb/new" className="cmdb-btn quantum-btn">Add CI</a>
            </div>
          </section>
            </div>

          </div>
        </>
      )}
    </div>
  );  
}