import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import api from "../api/apiClient";
import KPICard from "../components/KPICard";
import { useAuth } from "../auth/AuthContext";
import useSocket from "../hooks/useSocket";

// Ensure SOCKET_URL targets only the origin host (e.g., http://localhost:4000)
const RAW_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const SOCKET_URL = new URL(RAW_URL).origin;

/* LEFT PANELS */
function LeftPanels() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ModernPanel
        title="Tickets Overview"
        subtitle="SLA breaches, priority distribution, assignment load"
        chart="https://quickchart.io/chart?c={type:'bar',data:{labels:['P1','P2','P3'],datasets:[{label:'Tickets',data:[12,40,76]}]}}"
        accent="#556EE6"
      />

      <ModernPanel
        title="Asset Utilization"
        subtitle="Usage trends across departments"
        chart="https://quickchart.io/chart?c={type:'line',data:{labels:['Jan','Feb','Mar','Apr'],datasets:[{label:'Utilization',data:[70,75,80,78]}]}}"
        accent="#4ECDC4"
      />

      <ModernPanel
        title="Change Risk Distribution"
        subtitle="Upcoming changes & risk levels"
        chart="https://quickchart.io/chart?c={type:'pie',data:{labels:['Low','Medium','High'],datasets:[{data:[60,30,10]}]}}"
        accent="#F7B731"
      />
    </div>
  );
}

/* RIGHT PANELS */
function RightPanels() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SnapshotPanel
        title="CMDB Health"
        accent="#E91E63"
        items={[
          "Missing relationships: 14",
          "Orphan CIs: 6",
          "Discovery mismatches: 3"
        ]}
      />

      <SnapshotPanel
        title="Knowledge Base"
        accent="#00A8FF"
        items={[
          "Top Article: VPN Troubleshooting",
          "Search Success Rate: 87%",
          "New Articles: 12"
        ]}
      />

      <SnapshotPanel
        title="Admin Panel"
        accent="#9C27B0"
        items={[
          "Active Users: 421",
          "Pending Approvals: 8",
          "Audit Events Today: 112"
        ]}
      />
    </div>
  );
}

/* MODERN PANEL */
function ModernPanel({ title, subtitle, chart, accent }) {
  return (
    <div
      className="card"
      style={{
        padding: 24,
        borderRadius: 20,
        background: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        borderLeft: `6px solid ${accent}`
      }}
    >
      <h3 style={{ margin: 0, color: accent }}>{title}</h3>
      <p style={{ margin: "6px 0 16px", color: "#666" }}>{subtitle}</p>
      <img src={chart} alt={title} style={{ width: "100%", borderRadius: 12 }} />
    </div>
  );
}

/* SNAPSHOT PANEL */
function SnapshotPanel({ title, accent, items }) {
  return (
    <div
      className="card"
      style={{
        padding: 24,
        borderRadius: 20,
        background: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        borderLeft: `6px solid ${accent}`
      }}
    >
      <h3 style={{ margin: 0, color: accent }}>{title}</h3>
      <ul style={{ marginTop: 12, paddingLeft: 20 }}>
        {items.map((item) => (
          <li key={item} style={{ marginBottom: 6 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardHome() {
   // 1. Destructure the token from your Auth Context hook here
  const { token } = useAuth(); 
  // const [data, setData] = useState(null);
  const { user } = useAuth?.() || {};
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    breached: 0
  });

  // 1. WebSocket live update handler
  const handleDashboardUpdate = useCallback((updatedStats) => {
    if (updatedStats) {
      setStats((prev) => ({
        ...prev,
        ...updatedStats
      }));
    }
  }, []);

  useSocket("dashboard:update", handleDashboardUpdate);

  // 2. Initial REST API Fetch
    useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        const res = await api.get("/api/dashboard/stats", { timeout: 5000 });

        // if (isMounted && res?.data) {
        //   setStats({
        //     total: res.data.totalTickets ?? 0,    
        //     open: res.data.openTickets ?? 0,      
        //     closed: res.data.closedTickets ?? 0,  
        //     breached: res.data.breachedTickets ?? 0
        //   });
        // }

        if (isMounted && res?.data) {
          setStats({
            totalTickets: res.data.totalTickets ?? 0,
            openTickets: res.data.openTickets ?? 0,
            closedTickets: res.data.closedTickets ?? 0,
            breachedTickets: res.data.breachedTickets ?? 0,
          });
        }


      } catch (err) {
        console.warn("Backend API completely unavailable, using default stats payload.", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // 🟢 FIX HERE: If there is no token yet, turn off loading or handle the guest fallback
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false); 
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <div style={{ padding: "32px", color: "#64748b" }}>
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "20px",
        boxSizing: "border-box"
      }}
    >

      {/* HEADER */}
      <header className="assets-header">
        <div
          style={{
            background: "linear-gradient(135deg, #556EE6 0%, #4ECDC4 100%)",
            padding: "32px 24px",
            borderRadius: 20,
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
          }}
        >
          <img src="/s3-logo.png" alt="S3 Technologies" className="header-logo" />

          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
            ITSM Dashboard - Welcome {user?.name || "User"}
          </h1>

          <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
            Unified dashboard for Tickets, Assets, Changes, CMDB, Knowledge Base & Admin
          </p>
        </div>
      </header>

      {/* KPI STRIP */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginTop: 32
        }}
      >
         <KPICard title="Total Tickets" value={stats.totalTickets} color="#556EE6" icon="📊" />
        <KPICard title="Open Tickets" value={stats.openTickets} color="#FF6B6B" icon="📨" />
        <KPICard title="Resolved Tickets" value={stats.closedTickets} color="#4ECDC4" icon="✅" />
        <KPICard title="SLA Breached" value={stats.breachedTickets} color="#F7B731" icon="⚠️" />
        {/* <KPICard title="Total Tickets" value={stats.total} color="#556EE6" icon="📊" />
        <KPICard title="Open Tickets" value={stats?.open} color="#FF6B6B" icon="📨" />
        <KPICard title="Resolved Tickets" value={stats.closed} color="#4ECDC4" icon="✅" />
        <KPICard title="SLA Breached" value={stats.breached} color="#F7B731" icon="⚠️" /> */}
        {/* <KPICard title="Active Assets" value={stats?.activeAssets ?? 3421} color="#4ECDC4" icon="💻" />
        <KPICard title="Pending Changes" value={stats?.pendingChanges ?? 19} color="#556EE6" icon="🔄" />
        <KPICard title="CI Health Score" value={stats?.ciHealth ?? "92%"} color="#F7B731" icon="🧩" />
        <KPICard title="KB Search Success" value={stats?.kbSuccess ?? "87%"} color="#00A8FF" icon="📚" /> */}
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginTop: 32
        }}
      >
        <LeftPanels />
        <RightPanels />
      </div>
    </div>
  );
}


