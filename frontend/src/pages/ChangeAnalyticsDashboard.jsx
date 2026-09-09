// ./src/pages/ChangeAnalyticsDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import api from "../api/apiClient.js";
import useSocket from "../hooks/useSocket.js";
import StateDonut from "../components/analytics/StateDonut.jsx";
import RiskBar from "../components/analytics/RiskBar.jsx";
import KpiStrip from "../components/analytics/KpiStrip.jsx";
import RiskHeatmap from "../components/analytics/RiskHeatmap.jsx";
import TimelineChart from "../components/analytics/TimelineChart.jsx";
import CiImpactChart from "../components/analytics/CiImpactChart.jsx";

export default function ChangeAnalyticsDashboard() {
  const [stateCounts, setStateCounts] = useState([]);
  const [riskDist, setRiskDist] = useState([]);
  const [successStats, setSuccessStats] = useState({ success: 0, rollback: 0 });
  const [heatmap, setHeatmap] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [ciImpact, setCiImpact] = useState([]);

  const fetchAnalytics = async () => {
    try {
    const [stateRes, riskRes, successRes, heatmapRes, timelineRes, ciImpactRes] = await Promise.all([
      api.get("/api/analytics/state-counts"),
      api.get("/api/analytics/risk-distribution"),
      api.get("/api/analytics/success-rate"),
      api.get("/api/analytics/risk-heatmap"),
      api.get("/api/analytics/timeline?granularity=day"),
      api.get("/api/analytics/ci-impact")
    ]);

    setStateCounts(stateRes.data || stateRes || []);
      setRiskDist(riskRes.data || riskRes || []);
      setSuccessStats(successRes.data || successRes || { success: 0, rollback: 0 });
      setHeatmap(heatmapRes.data || heatmapRes || []);
      setTimeline(timelineRes.data || timelineRes || []);
      setCiImpact(ciImpactRes.data || ciImpactRes || []);
    } catch (err) {
      console.warn("Failed to fetch analytics data:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // const onInit = useCallback((data) => {
  //   if (data.stateCounts) setStateCounts(data.stateCounts);
  // }, []);

  // const onUpdate = useCallback(() => {
  //   fetchAnalytics();
  // }, []);

  // useSocket(onInit, onUpdate);

  // Handler for real-time socket updates from backend
  const handleDashboardUpdate = useCallback(() => {
    fetchAnalytics();
  }, []);

  // Pass event name as string and callback as function
  useSocket("dashboard:update", handleDashboardUpdate);

  return (
    <div style={{ padding: 20 }}>
      <h2>Change Analytics Dashboard</h2>
      <p style={{ color: "#666" }}>
        Live view of change volumes, risk distribution, and implementation KPIs.
      </p>

      <KpiStrip stateCounts={stateCounts} successStats={successStats} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <div style={{ background: "#fff", borderRadius: 8, padding: 16 }}>
          <h3>Changes by State</h3>
          <StateDonut stateCounts={stateCounts} />
        </div>

        <div style={{ background: "#fff", borderRadius: 8, padding: 16 }}>
          <h3>Risk Distribution</h3>
          <RiskBar riskDist={riskDist} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 16 }}>
            <h3>Risk Heatmap (Category / CI)</h3>
            <RiskHeatmap heatmap={heatmap} />
          </div>
  
          <div style={{ background: "#fff", borderRadius: 8, padding: 16 }}>
            <h3>Changes Timeline (per day)</h3>
            <TimelineChart timeline={timeline} granularity="day" />
          </div>
          <div style={{ background: "#fff", borderRadius: 8, padding: 16, marginTop: 24 }}>
            <h3>CI Impact (Top Changed CIs)</h3>
            <CiImpactChart data={ciImpact} />
          </div>
        </div>
      </div>
    </div>
  );
}
