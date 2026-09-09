import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function CMDBChartsSN() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/api/cmdb").then(res => {
      setItems(Array.isArray(res.data) ? res.data : res.data.table);
    });
  }, []);

  const count = (field, value) =>
    items.filter(ci => ci[field] === value).length;

  return (
    <div className="sn-charts">
      <h2>CMDB Charts</h2>

      <div className="sn-chart-card">
        <h3>Status Distribution</h3>
        <ul>
          <li>Active: {count("operational_status", "Active")}</li>
          <li>Maintenance: {count("operational_status", "Maintenance")}</li>
          <li>Retired: {count("operational_status", "Retired")}</li>
          <li>Down: {count("operational_status", "Down")}</li>
        </ul>
      </div>

      <div className="sn-chart-card">
        <h3>Environment Distribution</h3>
        <ul>
          <li>Production: {count("environment", "Production")}</li>
          <li>Staging: {count("environment", "Staging")}</li>
          <li>QA: {count("environment", "QA")}</li>
          <li>Development: {count("environment", "Development")}</li>
        </ul>
      </div>
    </div>
  );
}
