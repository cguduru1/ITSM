import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import MainLayout from "../layouts/MainLayout";

export default function Depreciation() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    api.get("/assets")
      .then(res => setAssets(res.data))
      .catch(err => console.error("LOAD ERROR:", err));
  }, []);

  return (
    <MainLayout>
      <div className="page">
        <h1 className="page-title">Asset Depreciation</h1>

        <button
          className="btn-primary"
          onClick={() => api.post("/depreciation/run").then(() => window.location.reload())}
        >
          Run Depreciation
        </button>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cost</th>
              <th>Depreciation</th>
              <th>Useful Life</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a._id}>
                <td>{a.name}</td>
                <td>{a.cost}</td>
                <td>{a.depreciationValue}</td>
                <td>{a.usefulLifeYears}</td>
                <td>{a.depreciationMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
