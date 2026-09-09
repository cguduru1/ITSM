import { useEffect, useState } from "react";
// import api from "../../api/api";
import apiClient from "../../api/apiClient";
import MainLayout from "../../layouts/MainLayout";
import ChangeSummary from "../../components/widgets/ChangeSummary.jsx";

export default function ChangeDashboard() {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState({});
  const [calendar, setCalendar] = useState([]);
  const [heatmap, setHeatmap] = useState([]);

  useEffect(() => {
    // api.get("/change-dashboard/summary")
    //   .then((res) => setData(res.data))
    //   .catch((err) => console.error(err));
  api.get("/api/analytics/cmdb-summary").then(r => setSummary(r.data));
  api.get("/api/analytics/cmdb-health").then(r => setHealth(r.data));
  api.get("/api/analytics/cmdb-relations").then(r => setRelations(r.data));
}, []);

  if (!data) return <MainLayout><p>Loading dashboard...</p></MainLayout>;

  return (
    <MainLayout>
          <div className="dashboard-container">
      <h1>Change Dashboard</h1>

      <div className="dashboard-grid">

          {/* Summary Widget */}
          <ChangeSummary data={summary} />

          {/* Calendar */}
          <section className="widget">
            <h3>Change Calendar</h3>
            {calendar.map(c => (
              <p key={c._id}>
                {c._id}: {c.count}
              </p>
            ))}
          </section>

          {/* Heatmap */}
          <section className="widget">
            <h3>Change Heatmap</h3>
            {heatmap.map((h, i) => (
              <p key={i}>
                {h.category} — {h.priority}
              </p>
            ))}
          </section>

        <section className="widget">
          <h3>Total Changes</h3>
          <p className="big-number">{data.total}</p>
        </section>

        <section className="widget">
          <h3>By Status</h3>
          {data.byStatus.map(s => (
            <p key={s._id}>{s._id}: {s.count}</p>
          ))}
        </section>

        <section className="widget">
          <h3>By Type</h3>
          {data.byType.map(t => (
            <p key={t._id}>{t._id}: {t.count}</p>
          ))}
        </section>

        <section className="widget">
          <h3>Emergency Changes</h3>
          <p>{data.emergency}</p>
        </section>

        <section className="widget">
          <h3>Changes Impacting Prod</h3>
          <p>{data.prodImpact}</p>
        </section>
      </div> 
      </div>
    </MainLayout>
  );
}
