// src/pages/AdminRoles.jsx
import React, { useEffect, useState } from 'react';
// import api from '../lib/api';
import RoleForm from '../components/RoleForm';
import UserRoleAssign from '../components/UserRoleAssign';
import apiClient from "../api/apiClient";


export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState(null);

  async function fetchRoles() {
    const res = await api.get('/api/admin/roles');
    setRoles(res.data || []);
  }

  useEffect(() => { fetchRoles(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Role Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20 }}>
        <div>
          <h3>Existing Roles</h3>
          <ul>
            {roles.map(r => (
              <li key={r._id} style={{ marginBottom: 8 }}>
                <strong>{r.name}</strong> — {r.description}
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => setSelected(r)}>Edit</button>
                </div>
              </li>
            ))}
          </ul>
          <h3>Create Role</h3>
          <RoleForm onSaved={() => { fetchRoles(); setSelected(null); }} />
        </div>

        <div>
          <h3>Assign Role to User</h3>
          <UserRoleAssign onAssigned={() => { /* optionally refresh */ }} />
          {selected && (
            <>
              <h4>Edit Role {selected.name}</h4>
              <RoleForm initial={selected} onSaved={() => { fetchRoles(); setSelected(null); }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
