import { useEffect, useState } from "react";
// import api from "../../api/api";
import apiClient from "../api/apiClient";


export default function CMDBRelationshipEditor({ ciId }) {
  const [ci, setCi] = useState(null);
  const [allCis, setAllCis] = useState([]);
  const [targetId, setTargetId] = useState("");
  const [relationType, setRelationType] = useState("depends_on");
  const [loading, setLoading] = useState(false);

  // Load CI + all CIs
  useEffect(() => {
    if (!ciId) return;

    api.get(`/api/cmdb/${ciId}`).then(r => setCi(r.data));
    api.get(`/api/cmdb`).then(r => setAllCis(r.data));
  }, [ciId]);

  const addRelation = async () => {
    if (!targetId) return;

    setLoading(true);

    await api.post(`/api/cmdb/${ciId}/relations`, {
      targetId,
      type: relationType
    });

    // Reload CI
    const updated = await api.get(`/api/cmdb/${ciId}`);
    setCi(updated.data);

    setTargetId("");
    setLoading(false);
  };

  const removeRelation = async relId => {
    setLoading(true);

    await api.delete(`/api/cmdb/${ciId}/relations/${relId}`);

    const updated = await api.get(`/api/cmdb/${ciId}`);
    setCi(updated.data);

    setLoading(false);
  };

  if (!ci) {
    return (
      <section className="widget">
        <h3>Relationships</h3>
        <p>Loading CI...</p>
      </section>
    );
  }

  return (
    <section className="widget">
      <h3>Relationship Editor</h3>

      {/* Existing relationships */}
      <div className="rel-list">
        {ci.relations?.length === 0 && <p>No relationships found.</p>}

        {ci.relations?.map(rel => (
          <div key={rel._id} className="rel-item">
            <span className="rel-type">{rel.type}</span>
            <span className="rel-target">{rel.targetName}</span>

            <button
              className="rel-remove"
              onClick={() => removeRelation(rel._id)}
              disabled={loading}
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      <hr />

      {/* Add new relationship */}
      <div className="rel-form">
        <h4>Add Relationship</h4>

        <label>Relationship Type</label>
        <select
          value={relationType}
          onChange={e => setRelationType(e.target.value)}
        >
          <option value="depends_on">Depends On</option>
          <option value="connected_to">Connected To</option>
          <option value="hosts">Hosts</option>
          <option value="runs_on">Runs On</option>
        </select>

        <label>Target CI</label>
        <select
          value={targetId}
          onChange={e => setTargetId(e.target.value)}
        >
          <option value="">Select CI</option>
          {allCis
            .filter(x => x._id !== ciId)
            .map(x => (
              <option key={x._id} value={x._id}>
                {x.name} ({x.type})
              </option>
            ))}
        </select>

        <button
          className="rel-add"
          onClick={addRelation}
          disabled={loading || !targetId}
        >
          Add Relationship
        </button>
      </div>

      <style>{`
        .rel-list {
          margin-bottom: 12px;
        }
        .rel-item {
          display: flex;
          justify-content: space-between;
          background: #f7f7f7;
          padding: 8px;
          border-radius: 6px;
          margin-bottom: 6px;
        }
        .rel-type {
          font-weight: 600;
          color: #2b6cb0;
        }
        .rel-target {
          flex: 1;
          margin-left: 10px;
        }
        .rel-remove {
          background: #e53e3e;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        .rel-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rel-add {
          background: #2b6cb0;
          color: white;
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}
