import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function CMDBEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ci, setCi] = useState(null);
  const [assetId, setAssetId] = useState("");
  const [changeId, setChangeId] = useState("");

const linkAsset = async () => {
  await api.post("/cmdb-rel/link-asset", { ciId: id, assetId });
  alert("Linked asset");
  window.location.reload();
};

const linkChange = async () => {
  await api.post("/cmdb-rel/link-change", { ciId: id, changeId });
  alert("Linked change");
  window.location.reload();
};

  const [mandatory, setMandatory] = useState({
    associated_change: false,
    justification_doc: false
  });

  useEffect(() => {
    api.get(`/cmdb/${id}`)
      .then((res) => setCi(res.data))
      .catch((err) => console.error("LOAD ERROR:", err));
  }, [id]);

  useEffect(() => {
    if (!ci) return;

    if (ci.operational_status !== "Operational") {
      setMandatory({
        associated_change: true,
        justification_doc: true
      });
    } else {
      setMandatory({
        associated_change: false,
        justification_doc: false
      });
    }
  }, [ci?.operational_status]);

  if (!ci) {
    return (
      <MainLayout>
        <p>Loading CI...</p>
      </MainLayout>
    );
  }

  const saveCI = async () => {
    try {
      await api.put(`/cmdb/${id}`, ci);
      alert("CI updated successfully");
      navigate("/cmdb");
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      alert("Failed to update CI");
    }
  };

  const deleteCI = async () => {
    if (!window.confirm("Delete this CI?")) return;

    try {
      await api.delete(`/cmdb/${id}`);
      alert("CI deleted");
      navigate("/cmdb");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Failed to delete CI");
    }
  };

  return (
    <MainLayout>
      <div className="cmdb-form">

        <h1>Edit CI</h1>

        {/* SECTION 1 — GENERAL INFO */}
        <h2>General Info</h2>
        <div className="two-column">
          <div>
            <label>Name</label>
            <input
              value={ci.name}
              onChange={(e) => setCi({ ...ci, name: e.target.value })}
            />

            <label>CI Class</label>
            <input value="Custom CI" readOnly />

            <label>Operational Status</label>
            <select
              value={ci.operational_status}
              onChange={(e) =>
                setCi({ ...ci, operational_status: e.target.value })
              }
            >
              <option>Operational</option>
              <option>Non-Operational</option>
              <option>Retired</option>
            </select>

            <label>Environment</label>
            <select
              value={ci.environment}
              onChange={(e) => setCi({ ...ci, environment: e.target.value })}
            >
              <option>Prod</option>
              <option>Test</option>
              <option>Dev</option>
            </select>
          </div>

          <div>
            <label>Asset Tag</label>
            <input
              value={ci.asset_tag}
              onChange={(e) => setCi({ ...ci, asset_tag: e.target.value })}
            />

            <label>Serial Number</label>
            <input
              value={ci.serial_number}
              onChange={(e) =>
                setCi({ ...ci, serial_number: e.target.value })
              }
            />

            <label>Manufacturer</label>
            <input
              value={ci.manufacturer}
              onChange={(e) =>
                setCi({ ...ci, manufacturer: e.target.value })
              }
            />

            <label>Model ID</label>
            <input
              value={ci.model_id}
              onChange={(e) => setCi({ ...ci, model_id: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION 2 — OWNERSHIP */}
        <h2>Ownership & Governance</h2>
        <div className="full-width">
          <label>Managed By</label>
          <input
            value={ci.managed_by}
            onChange={(e) => setCi({ ...ci, managed_by: e.target.value })}
          />

          <label>Assignment Group</label>
          <input
            value={ci.assignment_group}
            onChange={(e) =>
              setCi({ ...ci, assignment_group: e.target.value })
            }
          />

          <label>Supported By</label>
          <input
            value={ci.supported_by}
            onChange={(e) =>
              setCi({ ...ci, supported_by: e.target.value })
            }
          />

          <label>Business Criticality</label>
          <select
            value={ci.business_criticality}
            onChange={(e) =>
              setCi({ ...ci, business_criticality: e.target.value })
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>

        {/* SECTION 3 — MANUAL AUDIT TRAIL */}
        <h2>Manual Audit Trail</h2>
        <div className="full-width">
          <label>Maintenance Method</label>
          <select
            value={ci.maintenance_method}
            onChange={(e) =>
              setCi({ ...ci, maintenance_method: e.target.value })
            }
          >
            <option>Manual Entry</option>
            <option>Bulk Import</option>
            <option>API Sync</option>
          </select>

          <label>Last Attested Date</label>
          <input
            type="datetime-local"
            value={ci.last_attested?.slice(0, 16)}
            onChange={(e) =>
              setCi({ ...ci, last_attested: e.target.value })
            }
          />

          <label>Attested By</label>
          <input
            value={ci.attested_by}
            onChange={(e) => setCi({ ...ci, attested_by: e.target.value })}
          />

          <label>
            Associated Change {mandatory.associated_change && "(Required)"}
          </label>
          <input
            value={ci.associated_change}
            onChange={(e) =>
              setCi({ ...ci, associated_change: e.target.value })
            }
            required={mandatory.associated_change}
          />

          <label>
            Justification Document {mandatory.justification_doc && "(Required)"}
          </label>
          <textarea
            value={ci.justification_doc}
            onChange={(e) =>
              setCi({ ...ci, justification_doc: e.target.value })
            }
            required={mandatory.justification_doc}
          />
        </div>

        {/* SYSTEM FIELDS */}
        <h2>System Fields</h2>
        <div className="full-width">
          <label>Created At</label>
          <input value={ci.createdAt} readOnly />

          <label>Updated At</label>
          <input value={ci.updatedAt} readOnly />
        </div>

        <button className="btn-primary" onClick={saveCI}>
          Save
        </button>

        <button className="btn-danger" onClick={deleteCI}>
          Delete
        </button>
        <h2>Relationships</h2>

<div className="full-width">
  <label>Link Asset</label>
  <input
    placeholder="Asset ID"
    value={assetId}
    onChange={(e) => setAssetId(e.target.value)}
  />
  <button onClick={linkAsset}>Link Asset</button>

  <label>Link Change</label>
  <input
    placeholder="Change ID"
    value={changeId}
    onChange={(e) => setChangeId(e.target.value)}
  />
  <button onClick={linkChange}>Link Change</button>

  <h3>Linked Assets</h3>
  {ci.related_assets?.map((a) => <p key={a}>{a}</p>)}

  <h3>Linked Changes</h3>
  {ci.related_changes?.map((c) => <p key={c}>{c}</p>)}
</div>

      </div>
    </MainLayout>
  );
}
