// src/components/cmdb/CMDBCIList.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function CMDBCIList({ cis }) {
  return (
    <div className="cmdb-panel quantum">
      <h2>Configuration Items</h2>
      <table className="cmdb-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Env</th>
            <th>Dept</th>
            <th>Criticality</th>
          </tr>
        </thead>
        <tbody>
          {cis.map(ci => (
            <tr key={ci._id}>
              <td><Link to={`/cmdb/ci/${ci._id}`}>{ci.name}</Link></td>
              <td>{ci.type}</td>
              <td>{ci.environment}</td>
              <td>{ci.department}</td>
              <td>{ci.criticality}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
