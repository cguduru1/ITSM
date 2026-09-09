import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import MainLayout from "../layouts/MainLayout";

export default function Procurement() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ itemName: "", quantity: 1, vendor: "" });

  useEffect(() => {
    api.get("/procurement")
      .then(res => setRequests(res.data))
      .catch(err => console.error("LOAD ERROR:", err));
  }, []);

  const createRequest = async () => {
    await api.post("/procurement", form);
    window.location.reload();
  };

  return (
    <MainLayout>
      <div className="page">
        <h1 className="page-title">Procurement Requests</h1>

        <div className="card">
          <h3>Create Request</h3>
          <input
            placeholder="Item Name"
            value={form.itemName}
            onChange={e => setForm({ ...form, itemName: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })}
          />
          <input
            placeholder="Vendor"
            value={form.vendor}
            onChange={e => setForm({ ...form, vendor: e.target.value })}
          />
          <button className="btn-primary" onClick={createRequest}>Submit</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Vendor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r._id}>
                <td>{r.itemName}</td>
                <td>{r.quantity}</td>
                <td>{r.vendor}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
