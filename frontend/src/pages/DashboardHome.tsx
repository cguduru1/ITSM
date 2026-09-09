import React from "react";
import KPICard from "../components/KPICard";

export default function DashboardHome() {
  return (
    <div className="dashboard-home-container" style={{ position: "relative", padding: "20px" }}>

      <div
        style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      background: "radial-gradient(circle at 20% 30%, rgba(0,255,255,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,0,200,0.15), transparent 40%)",
      animation: "quantumPulse 8s infinite alternate",
      zIndex: -1
      }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>

      {/* QUANTUM HEADER */}
      <div
        style={{
          padding: "60px 40px",
          borderRadius: 40,
          background: "linear-gradient(135deg, rgba(0,255,200,0.25), rgba(0,120,255,0.25))",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 0 80px rgba(0,255,255,0.5)",
          color: "#fff",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Quantum energy rings */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "4px solid rgba(0,255,255,0.4)",
            animation: "spinSlow 12s linear infinite"
          }}
        />

        <h1
          style={{
            margin: 0,
            fontSize: 54,
            fontWeight: 900,
            letterSpacing: 3,
            textShadow: "0 0 30px rgba(0,255,255,0.9)"
          }}
        >
          <img src="/s3-logo.png" alt="S3 Technologies" className="header-logo" />
          S3 Technologies
        </h1>

        <p
          style={{
            marginTop: 16,
            opacity: 0.9,
            fontSize: 22,
            textShadow: "0 0 15px rgba(255,255,255,0.6)"
          }}
        >
          Neural‑accelerated dashboard for Tickets, Assets, Changes, CMDB, Knowledge Base & Admin
        </p>
      </div>

      {/* QUANTUM KPI STRIP */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 30
        }}
      >
        <KPICard title="Open Tickets" value={128} color="#00E5FF" glow icon="⚡" quantum />
        <KPICard title="Active Assets" value={3421} color="#7C4DFF" glow icon="💠" quantum />
        <KPICard title="Pending Changes" value={19} color="#FF4081" glow icon="🛠" quantum />
        <KPICard title="CI Health Score" value="92%" color="#00C853" glow icon="🧬" quantum />
        <KPICard title="KB Search Success" value="87%" color="#40C4FF" glow icon="📡" quantum />
      </div>

      {/* QUANTUM GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 50
        }}
      >

        {/* LEFT SIDE — QUANTUM PANELS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>

          <QuantumPanel
            title="Tickets Neural Overview"
            subtitle="AI‑driven SLA prediction & priority heatmap"
            chart="https://quickchart.io/chart?c={type:'radar',data:{labels:['P1','P2','P3'],datasets:[{label:'Tickets',data:[12,40,76]}]}}"
            accent="#00E5FF"
          />

          <QuantumPanel
            title="Asset Utilization Matrix"
            subtitle="Quantum trend analysis across departments"
            chart="https://quickchart.io/chart?c={type:'line',data:{labels:['Jan','Feb','Mar','Apr'],datasets:[{label:'Utilization',data:[70,75,80,78]}]}}"
            accent="#7C4DFF"
          />

          <QuantumPanel
            title="Change Risk Spectrum"
            subtitle="AI‑based risk distribution"
            chart="https://quickchart.io/chart?c={type:'doughnut',data:{labels:['Low','Medium','High'],datasets:[{data:[60,30,10]}]}}"
            accent="#FF4081"
          />

        </div>

        {/* RIGHT SIDE — SNAPSHOTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>

          <QuantumSnapshot
            title="CMDB Integrity Pulse"
            accent="#E91E63"
            items={[
              "Missing relationships: 14",
              "Orphan CIs: 6",
              "Discovery mismatches: 3"
            ]}
          />

          <QuantumSnapshot
            title="Knowledge Base Telemetry"
            accent="#40C4FF"
            items={[
              "Top Article: VPN Troubleshooting",
              "Search Success Rate: 87%",
              "New Articles: 12"
            ]}
          />

          <QuantumSnapshot
            title="Admin System Diagnostics"
            accent="#9C27B0"
            items={[
              "Active Users: 421",
              "Pending Approvals: 8",
              "Audit Events Today: 112"
            ]}
          />

        </div>
      </div>
    </div>
  );
}

/* QUANTUM PANEL */
function QuantumPanel({ title, subtitle, chart, accent }) {
  return (
    <div
      style={{
        padding: 40,
        borderRadius: 40,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(40px)",
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 60px ${accent}55`,
        color: "#fff",
        transition: "transform 0.4s ease, box-shadow 0.4s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-14px)";
        e.currentTarget.style.boxShadow = `0 0 80px ${accent}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 0 60px ${accent}55`;
      }}
    >
      <h3 style={{ margin: 0, fontSize: 28, color: accent }}>{title}</h3>
      <p style={{ margin: "12px 0 24px", color: "#ccc" }}>{subtitle}</p>
      <img src={chart} style={{ width: "100%", borderRadius: 30 }} />
    </div>
  );
}

/* QUANTUM SNAPSHOT */
function QuantumSnapshot({ title, accent, items }) {
  return (
    <div
      style={{
        padding: 40,
        borderRadius: 40,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(40px)",
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 60px ${accent}55`,
        color: "#fff",
        transition: "transform 0.4s ease, box-shadow 0.4s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-14px)";
        e.currentTarget.style.boxShadow = `0 0 80px ${accent}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 0 60px ${accent}55`;
      }}
    >
      <h3 style={{ margin: 0, fontSize: 28, color: accent }}>{title}</h3>
      <ul style={{ marginTop: 20, paddingLeft: 20 }}>
        {items.map((i) => (
          <li key={i} style={{ marginBottom: 12 }}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
