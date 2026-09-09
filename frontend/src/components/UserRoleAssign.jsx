// src/components/UserRoleAssign.jsx
import React, { useEffect, useState } from 'react';
// import api from '../lib/api';
import apiClient from "../api/apiClient";


export default function UserRoleAssign({ onAssigned }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    async function load() {
      const r1 = await api.get('/api/admin/roles');
      setRoles(r1.data || []);
      // fetch users from your user API
      const r2 = await api.get('/api/users?limit=200');
      setUsers(r2.data || []);
    }
    load();
  }, []);

  async function assign() {
    if (!userId || !roleId) return alert('Select user and role');
    await api.post('/api/admin/roles/assign', { userId, roleId });
    if (onAssigned) onAssigned();
    setUserId(''); setRoleId('');
    alert('Role assigned');
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <select value={userId} onChange={e=>setUserId(e.target.value)}>
        <option value="">Select user</option>
        {users.map(u => <option key={u._id} value={u._id}>{u.name || u.email}</option>)}
      </select>
      <select value={roleId} onChange={e=>setRoleId(e.target.value)}>
        <option value="">Select role</option>
        {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
      </select>
      <button onClick={assign}>Assign Role</button>
    </div>
  );
}
