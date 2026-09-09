import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import MainLayout from "../layouts/MainLayout";
import CMDBSummary from "../components/widgets/CMDBSummary.jsx";
import "../styles/badges.css";

export default function CMDBDashboard() {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState({});
  const [health, setHealth] = useState([]);
  const [relations, setRelations] = useState([]);
  const [anomalies, setAnomalies] = useState(0);

  useEffect(() => {
    // api.get("/cmdb-dashboard/summary")
    //   .then((res) => setData(res.data))
    //   .catch((err) => console.error(err));
    api.get("/api/analytics/cmdb-summary").then(r => setSummary(r.data));
    api.get("/api/analytics/cmdb-health").then(r => setHealth(r.data));
    api.get("/api/analytics/cmdb-relations").then(r => setRelations(r.data));
    api.get("/api/analytics/cmdb-anomalies").then(r => setAnomalies(r.data.anomalies));
  }, []);

  if (!data) return <MainLayout><p>Loading dashboard...</p></MainLayout>;

  return (
    <MainLayout>
      <div className="dashboard-container">
        <h1>CMDB Dashboard</h1>
      < div className="widget">
        <h3>Anomalies</h3>
        <p className="big-number badge-red">{anomalies}</p>
      </div>
      <div className="dashboard-grid">

        <CMDBSummary data={summary} />

        <section className="widget">
          <h3>CI Health</h3>
          {health.map(h => (
          <p key={h._id}>{h._id}: {h.count}</p>
         ))}
        </section>

        <section className="widget">
          <h3>Relationships</h3>
          {relations.map(r => (
          <p key={r._id}>{r.name}: {r.relations?.length || 0} relations</p>
          ))}
        </section>

        {/* TOTAL CI */}
        <div className="widget">
          <h3>Total CIs</h3>
          <p className="big-number">{data.total}</p>
        </div>

        {/* STATUS */}
        <div className="widget">
          <h3>By Operational Status</h3>
          {data.byStatus.map((s) => (
            <p key={s._id}>{s._id}: {s.count}</p>
          ))}
        </div>

        {/* ENVIRONMENT */}
        <div className="widget">
          <h3>By Environment</h3>
          {data.byEnvironment.map((e) => (
            <p key={e._id}>{e._id}: {e.count}</p>
          ))}
        </div>

        {/* MAINTENANCE METHOD */}
        <div className="widget">
          <h3>Maintenance Method</h3>
          {data.byMaintenance.map((m) => (
            <p key={m._id}>{m._id}: {m.count}</p>
          ))}
        </div>

        {/* ATTESTATION AGING */}
        <div className="widget">
          <h3>Attestation Aging</h3>
          {data.attestationAging.map((ci) => (
            <p key={ci._id}>
              {ci.name}: {Math.round(ci.days)} days since last attestation
            </p>
          ))}
        </div>

      </div>
      </div>
    </MainLayout>
  );
}
