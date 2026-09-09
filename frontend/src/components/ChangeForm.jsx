// components/ChangeForm.jsx
import React, { useState, useEffect } from 'react';
// import api from '../lib/api';
import apiClient from "../api/apiClient";


export default function ChangeForm({ onSaved, initial }) {
  const [form, setForm] = useState(initial || {
    title:'', description:'', type:'Normal', category:'', backoutPlan:'', affectedCIs:[]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/api/changes', form);
    onSaved(res.data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display:'grid', gap:8 }}>
      <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" required />
      <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
        <option>Normal</option><option>Emergency</option><option>Standard</option><option>Minor</option>
      </select>
      <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category" />
      <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" />
      <textarea value={form.backoutPlan} onChange={e=>setForm({...form,backoutPlan:e.target.value})} placeholder="Backout Plan" />
      <button type="submit">Create Change</button>
    </form>
  );
}
