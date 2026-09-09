import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

/**
 * Common inline cell styling for crisp padding and clear borders
 */
const cellStyle = {
  padding: '12px 16px',
  border: '1px solid #cbd5e1', // Light slate border
  fontSize: '14px',
};

const headerCellStyle = {
  ...cellStyle,
  color: '#0f172a',           // Dark slate text for high contrast
  backgroundColor: '#e2e8f0',  // Light header background
  fontWeight: '700',
};

/**
 * Assets list with search, filters, pagination, keyboard and ARIA.
 * Replace fetchAssets() with your API client (axios/fetch wrapper).
 */
export default function AssetsList({ filter, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const initialFilter = filter ?? location.state?.filter ?? null;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(initialFilter?.q ?? '');
  const [statusFilter, setStatusFilter] = useState(initialFilter?.status ?? '');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAssets() {
      try {
        setLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams();
        if (q) params.set('search', q); // Matches backend req.query.search filter
        if (statusFilter) params.set('status', statusFilter);
        params.set('page', page.toString());
        params.set('pageSize', pageSize.toString());

        const token =
          localStorage.getItem('accessToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('access');

        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`/api/assets?${params.toString()}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('access');
          navigate('/login');
          throw new Error('Unauthorized - Session Expired');
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch assets`);
        }

        const responseData = await res.json();

        if (mounted) {
          // 👈 FIX 1: Support backend { data: [...], totalPages } structure
          const assetArray = Array.isArray(responseData)
            ? responseData
            : responseData.data || responseData.items || [];

          setAssets(assetArray);
          if (responseData.totalPages) {
            setTotalPages(responseData.totalPages);
          }
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAssets();
    return () => {
      mounted = false;
    };
  }, [q, statusFilter, page, pageSize, initialFilter, navigate]);

  return (
    <section className="assets-list" aria-label="Assets list">
      <div className="list-toolbar flex justify-between items-center mb-4">
        <div className="filters flex gap-2">
          <label>
            <span className="sr-only">Search</span>
            <input
              type="search"
              placeholder="Search by tag, category..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              aria-label="Search assets"
              className="border p-2 rounded"
            />
          </label>

          <label>
            <select
              value={statusFilter}
              aria-label="Filter by status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border p-2 rounded"
            >
              <option value="">All statuses</option>
              <option value="In-Stock">In-Stock</option>
              <option value="Active">Active</option>
              <option value="Retired">Retired</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </label>
        </div>

        <div className="list-actions flex gap-2">
          <button
            className="btn bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => navigate('/assets/new')}
          >
            + Add Asset
          </button>

          {user?.isAdmin && (
            <button
              className="btn bg-gray-700 text-white px-4 py-2 rounded"
              onClick={() => navigate('/admin/assets')}
            >
              Admin
            </button>
          )}
        </div>
      </div>

      {loading && <div className="loading p-4 text-gray-500">Loading assets…</div>}

      {error && (
        <div role="alert" className="error p-4 bg-red-100 text-red-700 rounded mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
            }}
            role="table"
            aria-label="Assets table"
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>Asset Tag / Name</th>
                <th style={headerCellStyle}>Type / Category</th>
                <th style={headerCellStyle}>Status</th>
                <th style={headerCellStyle}>Owner</th>
                <th style={headerCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...cellStyle, textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No assets found
                  </td>
                </tr>
              ) : (
                assets.map((a, index) => {
                  const id = a._id || a.id;
                  const displayName = a.name || a.assetTag || 'Unnamed Asset';
                  const displayType = a.type || a.category || 'Hardware';
                  const displayOwner = a.owner || a.assignedTo || '—';

                  return (
                    <tr
                      key={id}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={cellStyle}>
                        <Link
                          to={`/assets/${id}`}
                          style={{ fontWeight: '600', color: '#2563eb', textDecoration: 'none' }}
                        >
                          {displayName}
                        </Link>
                      </td>
                      <td style={{ ...cellStyle, color: '#334155' }}>{displayType}</td>
                      <td style={{ ...cellStyle }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            borderRadius: '9999px',
                          }}
                        >
                          {a.status || 'In-Stock'}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, color: '#334155' }}>{displayOwner}</td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => navigate(`/assets/${id}`)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/assets/edit/${id}`)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <footer className="pagination flex justify-between items-center mt-4" role="navigation" aria-label="Pagination">
        <button
          className="btn border px-3 py-1 rounded disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          aria-label="Previous page"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="btn border px-3 py-1 rounded disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          aria-label="Next page"
        >
          Next
        </button>
      </footer>
    </section>
  );
}