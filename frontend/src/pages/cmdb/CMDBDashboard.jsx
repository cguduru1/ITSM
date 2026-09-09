import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
// import api from "../../api/api";
import MainLayout from "../../layouts/MainLayout";

import CMDBSummary from "../../components/widgets/CMDBSummary.jsx";
import CMDBDataQuality from "../../components/cmdb/CMDBDataQuality.jsx";
import CMDBRelationshipEditor from "../../components/cmdb/CMDBRelationshipEditor.jsx";
import CMDBCharts from "../../components/cmdb/CMDBCharts.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";


export default function CMDBDashboard() {
  const { user } = useAuth();   // FIX: user now exists

  const [summary, setSummary] = useState({});
  const [health, setHealth] = useState([]);
  const [relations, setRelations] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    api.get("/api/analytics/cmdb-summary").then(r => setSummary(r.data));
    api.get("/api/analytics/cmdb-health").then(r => setHealth(r.data));
    api.get("/api/analytics/cmdb-relations").then(r => setRelations(r.data));
    api.get("/api/analytics/cmdb-charts").then(r => setAnalytics(r.data));
  }, []);

  return (
    <MainLayout>
      <div className="dashboard-container">
        <h1>CMDB Dashboard</h1>

        {/* VIEW PERMISSION */}
        {user?.permissions?.cmdb?.includes("view") && (
          <Link to="/workspace/cmdb" className="workspace-tile">
            <div className="tile-icon">🧩</div>
            <div className="tile-title">CMDB</div>
            <div className="tile-desc">Configuration Items & Relationships</div>
          </Link>
        )}

        {/* CREATE PERMISSION */}
        {user?.permissions?.cmdb?.includes("create") && (
          <Link to="/cmdb/new" className="cmdb-btn">Add CI</Link>
        )}

        {/* UPDATE PERMISSION */}
        {user?.permissions?.cmdb?.includes("update") && (
          <div className="cmdb-update-section">

            {/* RELATIONSHIP EDITOR */}
            {user?.permissions?.cmdb?.includes("relationships") && (
              <CMDBRelationshipEditor />
            )}

            {/* EDIT LINK */}
            <Link to="/cmdb/edit" className="cmdb-link">Edit CI</Link>
          </div>
        )}

        {/* DELETE PERMISSION */}
        {user?.permissions?.cmdb?.includes("delete") && (
          <button className="cmdb-btn danger">Delete</button>
        )}

        {/* ANALYTICS PERMISSION */}
        {user?.permissions?.cmdb?.includes("analytics") && (
          <CMDBCharts analytics={analytics} />
        )}

        <div className="dashboard-grid">

          {/* Summary Widget */}
          <CMDBSummary data={summary} />

          {/* Data Quality */}
          <CMDBDataQuality />

          {/* CI Health */}
          <section className="widget">
            <h3>CI Health</h3>
            {health.map(h => (
              <p key={h._id}>{h._id}: {h.count}</p>
            ))}
          </section>

          {/* Relationships */}
          <section className="widget">
            <h3>Relationships</h3>
            {relations.map(r => (
              <p key={r._id}>{r.name}: {r.relations?.length || 0} relations</p>
            ))}
          </section>

        </div>
      </div>
    </MainLayout>
  );
}
