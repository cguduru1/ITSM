import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import "../styles/badges.css";

export default function CMDBDetails() {
  const { id } = useParams();
  const [ci, setCi] = useState(null);

  useEffect(() => {
    api.get(`/cmdb/${id}`)
      .then((res) => setCi(res.data))
      .catch((err) => console.error("LOAD ERROR:", err));
  }, [id]);

  if (!ci) {
    return (
      <MainLayout>
        <p>Loading CI details...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="cmdb-details-page">
        <h1>{ci.name}</h1>

        <h2>General Info</h2>
        <p><strong>Operational Status:</strong> {ci.operational_status}</p>
        <p><strong>Environment:</strong> {ci.environment}</p>
        <p><strong>Asset Tag:</strong> {ci.asset_tag}</p>
        <p><strong>Serial Number:</strong> {ci.serial_number}</p>
        <p><strong>Manufacturer:</strong> {ci.manufacturer}</p>
        <p><strong>Model ID:</strong> {ci.model_id}</p>

        <h2>Ownership & Governance</h2>
        <p><strong>Managed By:</strong> {ci.managed_by}</p>
        <p><strong>Assignment Group:</strong> {ci.assignment_group}</p>
        <p><strong>Supported By:</strong> {ci.supported_by}</p>
        <p><strong>Business Criticality:</strong> {ci.business_criticality}</p>

        <h2>Manual Audit Trail</h2>
        <p><strong>Maintenance Method:</strong> {ci.maintenance_method}</p>
        <p>
          <strong>Last Attested:</strong>{" "}
          {ci.last_attested
            ? new Date(ci.last_attested).toLocaleString()
            : "N/A"}
        </p>
        <p><strong>Attested By:</strong> {ci.attested_by}</p>
        <p><strong>Associated Change:</strong> {ci.associated_change}</p>
        <p><strong>Justification Document:</strong></p>
        <p>{ci.justification_doc}</p>

        <h2>System Fields</h2>
        <p><strong>Created At:</strong> {ci.createdAt}</p>
        <p><strong>Updated At:</strong> {ci.updatedAt}</p>

        {ci.isAnomaly && <span className="badge-red">Anomaly Detected</span>}

      </div>
    </MainLayout>
  );
}
