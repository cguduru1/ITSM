// pages/ChangeWorkspace.jsx
import React, { useEffect, useState, useCallback } from 'react';
// import api from '../lib/api';
import ChangeForm from '../components/ChangeForm';
import useSocket from '../hooks/useSocket';
import DashboardCharts from '../components/DashboardCharts';
import apiClient from "../api/apiClient";


export default function ChangeWorkspace() {
  const [changes, setChanges] = useState([]);
  const [stateCounts, setStateCounts] = useState([]);
  const fetch = async () => {
    const res = await api.get('/api/changes');
    setChanges(res.data);
  };
  useEffect(()=>{ fetch(); }, []);

  const onInit = useCallback((data) => {
    setStateCounts(data.stateCounts || []);
  }, []);
  const onUpdate = useCallback((payload) => {
    // simple: refetch list and update counts
    fetch();
    api.get('/api/analytics/state-counts').then(r=>setStateCounts(r.data));
  }, []);

  useSocket(onInit, onUpdate);

  return (
    <div style={{ padding:20 }}>
      <h2>Change Workspace</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap:20 }}>
        <div>
          <h3>Open Changes</h3>
          <button onClick={fetch}>Refresh</button>
          <ul>
            {changes.map(c => (
              <li key={c._id}>
                <strong>{c.reference || c._id}</strong> — {c.title} <em>({c.state})</em>
              </li>
            ))}
          </ul>
          <h3>Create Change</h3>
          <ChangeForm onSaved={(ch)=>{ fetch(); }} />
        </div>

        <div>
          <DashboardCharts stateCounts={stateCounts} />
        </div>
      </div>
    </div>
  );
}
