import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import MainLayout from "../layouts/MainLayout";

export default function CIView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ci, setCi] = useState(null);
  const [relationships, setRelationships] = useState(null);
  const [impact, setImpact] = useState(null);
  const [graph, setGraph] = useState(null);

  const loadCI = async () => {
    try {
    const res = await api.get(`/cmdb/${id}`);
    setCi(res.data);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  const loadRelationships = async () => {
    const res = await api.get(`/cmdb/${id}/relationships`);
    setRelationships(res.data);
  };

  const loadImpact = async () => {
    const res = await api.post(`/cmdb/impact`, { ciId: id });
    setImpact(res.data);
  };

  const loadGraph = async () => {
    const res = await api.get(`/cmdb/graph`);
    setGraph(res.data);
  };

  useEffect(() => {
    loadCI();
    loadRelationships();
    loadImpact();
    loadGraph();
  }, [id]);

  if (!ci || !relationships || !impact || !graph)
    return <MainLayout><p>Loading CI details...</p></MainLayout>;

  return (
    <MainLayout>
      <div className="page-container">
          <div className="sn-view-grid">
            <div>
              <label>Status</label>
              <p>{ci.operational_status}</p>
            </div>

            <div>
              <label>Environment</label>
              <p>{ci.environment}</p>
            </div>

            <div>
              <label>Category</label>
              <p>{ci.category}</p>
            </div>

            <div>
              <label>Asset Tag</label>
              <p>{ci.asset_tag || "—"}</p>
            </div>

            <div>
              <label>Serial Number</label>
              <p>{ci.serial_number || "—"}</p>
            </div>

            <div>
              <label>Managed By</label>
              <p>{ci.managed_by || "—"}</p>
            </div>

            <div>
              <label>Maintenance Method</label>
              <p>{ci.maintenance_method || "—"}</p>
            </div>

            <div>
              <label>Last Attested</label>
              <p>{ci.last_attested ? new Date(ci.last_attested).toLocaleString() : "—"}</p>
            </div>
          </div>

        <h2>Impact Analysis</h2>
        <p>Risk Level: {impact.risk}</p>
        <p>Impact Score: {impact.impactScore}</p>

        <h3>Affected Dependencies</h3>
        {impact.affected.dependencies.map(d => <p key={d._id}>{d.name}</p>)}

        <h3>Affected Dependents</h3>
        {impact.affected.dependents.map(d => <p key={d._id}>{d.name}</p>)}

        <h3>Affected Assets</h3>
        {impact.affected.assets.map(a => <p key={a._id}>{a.asset_tag}</p>)}

        <h3>Affected Changes</h3>
        {impact.affected.changes.map(c => <p key={c._id}>{c.title}</p>)}

        <hr />

        <h2>Dependency Graph</h2>
        <pre>{JSON.stringify(graph, null, 2)}</pre>

        <CIHealthWidgetSN score={ci.health_score} />

        <div className="sn-view-actions">
            <button className="btn-primary" onClick={() => navigate(`/cmdb/edit/${ci._id}`)}>
              Edit CI
            </button>
            <button className="btn-secondary" onClick={() => navigate("/cmdb")}>
              Back
            </button>
          </div>
      </div>
      
    </MainLayout>
  );
}
