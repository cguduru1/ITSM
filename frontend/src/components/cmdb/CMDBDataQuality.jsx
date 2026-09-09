// src/components/cmdb/CMDBDataQuality.jsx
import React, { useEffect, useState } from "react";
// import api from "../../api/api";
import apiClient from "../../api/apiClient";

export default function CMDBDataQuality() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/api/cmdb/data-quality").then(res => setItems(res.data));
  }, []);

  return (
    <div className="cmdb-panel quantum">
      <h2>Data Quality</h2>
      <table className="cmdb-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Score</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {items.map(i => (
            <tr key={i._id}>
              <td>{i.name}</td>
              <td>{i.type}</td>
              <td>{i.score}</td>
              <td>{i.issues.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
