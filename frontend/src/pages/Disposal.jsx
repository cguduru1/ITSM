import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import MainLayout from "../layouts/MainLayout";

export default function Disposal() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    assetId: "",
    disposalType: "Scrap",
    amountRecovered: 0
  });

  useEffect(() => {
    api.get("/disposal")
      .then(res => setRecords(res.data))
      .catch(err => console.error("LOAD ERROR:", err));
  }, []);

  const dispose = async () => {
    await api.post("/disposal", { ...form, disposalDate: new Date() });
    window.location.reload();
  };

  return (
    <MainLayout>
      <div className="page">
        <h1 className="page-title">Asset Disposal</h1>

        <div className="card">
          <h3>Dispose Asset</h3>
          <input
            placeholder="Asset ID"
            value={form.assetId}
            onChange={e => setForm({ ...form, assetId: e.target.value })}
          />
          <select
            value={form.disposalType}
            onChange={e => setForm({ ...form, disposalType: e.target.value })}
          >
            <option>Scrap</option>
            <option>Resell</option>
            <option>Recycle</option>
          </select>
          <input
            type="number"
            placeholder="Amount Recovered"
            value={form.amountRecovered}
            onChange={e => setForm({ ...form, amountRecovered: e.target.value })}
          />
          <button className="btn-primary" onClick={dispose}>Dispose</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Type</th>
              <th>Date</th>
              <th>Recovered</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r._id}>
                <td>{r.assetId}</td>
                <td>{r.disposalType}</td>
                <td>{new Date(r.disposalDate).toLocaleDateString()}</td>
                <td>{r.amountRecovered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
