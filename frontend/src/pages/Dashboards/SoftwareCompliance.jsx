import React, { useEffect, useState } from "react";
import { getSoftwareCompliance } from "../../api/assetApi";

export default function SoftwareCompliance() {
  const [rows, setRows] = useState([]);
  useEffect(() => { getSoftwareCompliance().then(r => setRows(r.data)); }, []);
  return (
    <div className="page">
      <h1>Software Compliance</h1>
      <table className="table">
        <thead><tr><th>Software</th><th>Purchased</th><th>Allocated</th><th>Available</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.licenseId}>
              <td>{r.softwareName}</td>
              <td>{r.totalSeatsPurchased}</td>
              <td>{r.seatsAllocated}</td>
              <td>{r.availableSeats}</td>
              <td>{r.complianceStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
