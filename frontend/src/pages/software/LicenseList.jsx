import React, { useEffect, useState } from "react";
import { getLicenses } from "../../api/assetApi";
import { useNavigate } from "react-router-dom";

export default function LicenseList() {
  const [licenses, setLicenses] = useState([]);
  const nav = useNavigate();

  useEffect(() => { getLicenses().then(r => setLicenses(r.data)); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Software Licenses</h1>
        <button onClick={() => nav("/software/new")}>+ Add License</button>
      </div>

      <table className="table">
        <thead><tr><th>Name</th><th>Publisher</th><th>Type</th><th>Seats</th><th>Renewal</th></tr></thead>
        <tbody>
          {licenses.map(l => (
            <tr key={l.licenseId}>
              <td>{l.softwareName}</td>
              <td>{l.publisher}</td>
              <td>{l.licenseType}</td>
              <td>{l.totalSeatsPurchased}</td>
              <td>{l.renewalDate ? new Date(l.renewalDate).toLocaleDateString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
