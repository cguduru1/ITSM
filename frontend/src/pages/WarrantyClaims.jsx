import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import MainLayout from "../layouts/MainLayout";

export default function WarrantyClaims() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    api.get("/warranty")
      .then(res => setClaims(res.data))
      .catch(err => console.error("LOAD ERROR:", err));
  }, []);

  return (
    <MainLayout>
      <div className="page">
        <h1 className="page-title">Warranty Claims</h1>

        <button
          className="btn-primary"
          onClick={() => api.post("/warranty/auto").then(() => window.location.reload())}
        >
          Auto Create Claims
        </button>

        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Vendor</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Claim Date</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(c => (
              <tr key={c._id}>
                <td>{c.assetId?.name}</td>
                <td>{c.vendor}</td>
                <td>{c.issue}</td>
                <td>{c.status}</td>
                <td>{new Date(c.claimDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
