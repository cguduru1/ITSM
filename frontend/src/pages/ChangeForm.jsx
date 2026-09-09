// ./src/pages/ChangeForm.jsx
import React, { useEffect, useState } from "react";
// import { createChange, getChange, updateChange } from "../lib/changeApi.js";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/apiClient";

export default function ChangeForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Normal",
    category: "",
    backoutPlan: "",
    affectedCIs: []
  });

  useEffect(() => {
    if (id) {
      getChange(id).then((res) => setForm(res.data));
    }
  }, [id]);

  const save = async () => {
    if (id) {
      await updateChange(id, form);
    } else {
      await createChange(form);
    }
    navigate("/changes");
  };

  return (
    <div>
      <h2>{id ? "Edit Change" : "Create Change"}</h2>

      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Title"
      />

      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
      />

      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option>Normal</option>
        <option>Emergency</option>
        <option>Standard</option>
        <option>Minor</option>
      </select>

      <input
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        placeholder="Category"
      />

      <textarea
        value={form.backoutPlan}
        onChange={(e) => setForm({ ...form, backoutPlan: e.target.value })}
        placeholder="Backout Plan"
      />

      <button onClick={save}>{id ? "Update" : "Create"}</button>
    </div>
  );
}
