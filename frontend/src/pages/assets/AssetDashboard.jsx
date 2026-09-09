import { useEffect, useState } from "react";
// import api from "../../api/api";
import apiClient from "../../api/apiClient";
import MainLayout from "../../layouts/MainLayout";
import AssetSummary from "../../components/widgets/AssetSummary.jsx";

export default function AssetDashboard() {
  const [summary, setSummary] = useState({});
  const [lifecycle, setLifecycle] = useState([]);
  const [utilization, setUtilization] = useState([]);

  useEffect(() => {
    api.get("/api/analytics/asset-summary").then(r => setSummary(r.data));
    api.get("/api/analytics/asset-lifecycle").then(r => setLifecycle(r.data));
    api.get("/api/analytics/asset-utilization").then(r => setUtilization(r.data));
  }, []);

  return (
    <MainLayout>
      <div className="dashboard-container">
        <h1>Asset Dashboard</h1>

        <div className="dashboard-grid">

          {/* Summary Widget */}
          <AssetSummary data={summary} />

          {/* Lifecycle */}
          <section className="widget">
            <h3>Lifecycle Stages</h3>
            {lifecycle.map(stage => (
              <p key={stage._id}>
                {stage._id}: {stage.count}
              </p>
            ))}
          </section>

          {/* Utilization */}
          <section className="widget">
            <h3>Utilization by Department</h3>
            {utilization.map(u => (
              <p key={u._id}>
                {u._id}: {u.count}
              </p>
            ))}
          </section>

        </div>
      </div>
    </MainLayout>
  );
}
