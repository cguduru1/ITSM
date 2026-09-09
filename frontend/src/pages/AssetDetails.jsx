import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from "../api/api";

export default function AssetDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    let isMounted = true;

    async function fetchAssetDetails() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/api/assets/${id}`);
        
        if (isMounted) {
          // Unwraps nested backend payloads e.g. { data: assetObj } or raw assetObj
          setAsset(res.data?.data || res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch asset details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) fetchAssetDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Loading asset details…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', border: '1px solid #fecaca', marginBottom: '1rem' }}>
          Error: {error}
        </div>
        <button
          onClick={() => navigate('/assets')}
          style={{ padding: '6px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
        >
          Back to Assets List
        </button>
      </div>
    );
  }

  if (!asset) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No asset details found.</p>
        <button
          onClick={() => navigate('/assets')}
          style={{ marginTop: '1rem', padding: '6px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
        >
          Back to Assets
        </button>
      </div>
    );
  }

  // Fallback bindings to handle newly created asset schema variations
  const displayName = asset.name || asset.assetTag || 'Unnamed Asset';
  const displayType = asset.type || asset.category || 'Hardware';
  const displayOwner = asset.owner || asset.assignedTo || 'Unassigned';
  const displayStatus = asset.status || 'In-Stock';
  const displayDescription = asset.description || asset.description || 'Unassigned';

return (
    <div className="page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
          {displayName}
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate(`/assets/edit/${id}`)}
            style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #2563eb', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer', fontWeight: '500' }}
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/assets')}
            style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', cursor: 'pointer' }}
          >
            Back to List
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <p style={{ margin: 0 }}>
            <b style={{ color: '#475569' }}>Asset Tag:</b> {asset.assetTag || 'N/A'}
          </p>
          <p style={{ margin: 0 }}>
            <b style={{ color: '#475569' }}>Type / Category:</b> {displayType}
          </p>
          <p style={{ margin: 0 }}>
            <b style={{ color: '#475569' }}>Status:</b>{' '}
            <span style={{ padding: '2px 8px', fontSize: '12px', fontWeight: '600', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '9999px' }}>
              {displayStatus}
            </span>
          </p>
          <p style={{ margin: 0 }}>
            <b style={{ color: '#475569' }}>Owner:</b> {displayOwner}
          </p>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <b style={{ color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Description:</b>
          <p style={{ margin: 0, color: '#334155' }}>
            {asset.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: 0, marginBottom: '1rem', color: '#0f172a' }}>
          Relationships
        </h3>

        {!asset.relationships || asset.relationships.length === 0 ? (
          <p style={{ color: '#64748b', margin: 0 }}>No relationships found for this asset.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {asset.relationships.map((r, index) => (
              <div key={r.ciId || index} style={{ padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px' }}>
                <span style={{ fontWeight: '600', color: '#2563eb' }}>{r.relation || 'Relates to'}</span> → {r.ciId}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
