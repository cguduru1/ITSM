// src/components/RoleForm.jsx
import React, { useState, useEffect } from 'react';
// import api from '../lib/api';
import apiClient from "../api/apiClient";


const defaultPerm = { resource: 'change_request', actions: ['create','read','update','delete'] };

export default function RoleForm({ initial, onSaved }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [permissions, setPermissions] = useState(initial?.permissions || [defaultPerm]);

  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setDescription(initial.description || '');
      setPermissions(initial.permissions || [defaultPerm]);
    }
  }, [initial]);

  function updatePermission(idx, field, value) {
    const copy = [...permissions];
    copy[idx] = { ...copy[idx], [field]: value };
    setPermissions(copy);
  }

  function addPermission() {
    setPermissions([...permissions, { resource: '', actions: [] }]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { name, description, permissions };
    if (initial && initial._id) {
      await api.put(`/api/admin/roles/${initial._id}`, payload);
    } else {
      await api.post('/api/admin/roles', payload);
    }
    if (onSaved) onSaved();
    setName(''); setDescription(''); setPermissions([defaultPerm]);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
      <input placeholder="Role name" value={name} onChange={e=>setName(e.target.value)} required />
      <input placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
      <div>
        <h4>Permissions</h4>
        {permissions.map((p, idx) => (
          <div key={idx} style={{ marginBottom: 8, border: '1px solid #eee', padding: 8 }}>
            <input placeholder="Resource" value={p.resource} onChange={e=>updatePermission(idx, 'resource', e.target.value)} />
            <div style={{ marginTop: 6 }}>
              {['create','read','update','delete'].map(a => (
                <label key={a} style={{ marginRight: 8 }}>
                  <input
                    type="checkbox"
                    checked={p.actions.includes(a)}
                    onChange={e => {
                      const actions = new Set(p.actions || []);
                      if (e.target.checked) actions.add(a); else actions.delete(a);
                      updatePermission(idx, 'actions', Array.from(actions));
                    }}
                  /> {a}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={addPermission}>Add Permission</button>
      </div>
      <button type="submit">Save Role</button>
    </form>
  );
}
