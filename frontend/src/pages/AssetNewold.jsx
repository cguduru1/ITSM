import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function AssetNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});

  const save = async () => {
    await api.post("/assets", form);
    navigate("/assets");
  };

  return (
    <div className="page">
      <h1>New Asset</h1>

      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Type" onChange={(e) => setForm({ ...form, type: e.target.value })} />
      <input placeholder="Status" onChange={(e) => setForm({ ...form, status: e.target.value })} />
      <input placeholder="Owner" onChange={(e) => setForm({ ...form, owner: e.target.value })} />

      <button onClick={save}>Save</button>
    </div>
  );
}
