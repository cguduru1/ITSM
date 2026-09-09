import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import MainLayout from "../layouts/MainLayout";

export default function FailureRisk() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    api.get("/assets")
      .then(res => setAssets(res.data))
      .catch(err => console.error("LOAD ERROR:", err));
  }, []);

  const runModel = async () => {
    await api.post("/failure/run");
    window.location.reload();
  };

  return (
    <MainLayout>
      <div className="page">
        <h1 className="page-title">AI Predictive Failure</h1>

        <button className="btn-primary" onClick={runModel}>
          Run AI Model
        </button>

        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Health</th>
              <th>Incidents</th>
              <th>CPU</th>
              <th>Temp</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a._id}>
                <td>{a.name}</td>
                <td>{a.healthScore}</td>
                <td>{a.incidentCount}</td>
                <td>{a.cpuUsage}%</td>
                <td>{a.temperature}°C</td>
                <td>{a.failureRisk}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
