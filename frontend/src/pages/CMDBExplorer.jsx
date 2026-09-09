// src/pages/CMDBExplorer.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { Link } from "react-router-dom";  
import CMDBCIList from "../components/cmdb/CMDBCIList";
import CIDependencyMap from "../components/cmdb/CIDependencyMap";
import "../styles/cmdb.css";
import "../styles/ticket.css"; 

export default function CMDBExplorer() {
  const [filters, setFilters] = useState({ search: "", type: "", env: "" });
  const [cis, setCis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inspectedCi, setInspectedCi] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Fetch CIs whenever filters change
  const fetchCis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string from active filters
      const queryParams = new URLSearchParams();
      
      queryParams.append("page", currentPage);
      queryParams.append("pageSize", itemsPerPage);
      
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.business_criticality) queryParams.append("business_criticality", filters.business_criticality);
      if (filters.operational_status) queryParams.append("operational_status", filters.operational_status);
      if (filters.environment) queryParams.append("environment", filters.environment);


      // const queryStr = queryParams.toString();
      // const endpoint = queryStr ? `/api/cmdb?${queryStr}` : "/api/cmdb";
      const endpoint = `/api/cmdb?${queryParams.toString()}`;

      const res = await apiClient.get(endpoint);

      console.log("Endpoint:", endpoint);
      console.log("Axios response:", res);
      console.log("Response data:", res.data);

      // FIX 1: Safely unpack Axios res.data or direct array response
      const responseData = res?.data ?? res;

      const list = Array.isArray(responseData)
        ? responseData
        : responseData?.table || responseData?.data || responseData?.cis || [];

      setCis(list);
      setTotalPages(responseData?.totalPages || 1);
      setCurrentPage(1);
    } catch (err) { 
      console.error("Failed to fetch CIs:", err);
      setError("Failed to load CIs. Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    // Debounce search input to avoid spamming the backend
    const handler = setTimeout(() => {
      fetchCis();
    }, 300);

    return () => clearTimeout(handler);
  }, [filters.search, filters.business_criticality, filters.operational_status, filters.environment, currentPage]);

  // Handle Input Changes and Reset Page
  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setCurrentPage(1); // FIXED: Safely reset page counter on explicit action
  };

  // Handle CI Deletion
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      // FIX 2: Correct method is apiClient.delete, not apiClient.del
      if (typeof apiClient.delete === "function") {
        await apiClient.delete(`/api/cmdb/${id}`);
      } else {
        await apiClient.del(`/api/cmdb/${id}`);
      }
      // setCis((prev) => prev.filter((item) => item._id !== id));
      fetchCis();
      if (inspectedCi?._id === id) setInspectedCi(null);
      alert("CI deleted successfully!");
    } catch (err) {
      console.error("Failed to delete CI:", err);
      alert(`Error deleting CI: ${err.response?.data?.error || err.message || "Unauthorized"}`);
    }
  };

  // Pagination Calculations
  // const totalPages = Math.ceil(cis.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCis = cis.slice(startIndex, startIndex + itemsPerPage);

  const cellStyle = {
    padding: "12px 16px",
    verticalAlign: "middle",
    borderBottom: "1px solid #334155",
    borderRight: "1px solid #334155"
  };

  return (
    <div className="cmdb-root" style={{ padding: "20px", color: "#f8fafc" }}>
      <div className="ticket-header"> 
        <h1>🗂 CMDB Explorer</h1>
        <p>Browse and filter configuration items</p>
        <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
                         ← Back to Dashboard
                       </Link>
      </div>

      {/* NEW SECTION: MOUNT RELATIONSHIP MAP */}
      <CIDependencyMap activeCi={inspectedCi} />

      {/* Filter Controls */}
      <div className="cmdb-filters" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search CI name..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #334155", background: "#0f172a", color: "#fff" }}
        />
        <select
          value={filters.business_criticality}
          onChange={(e) => handleFilterChange("business_criticality", e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #334155", background: "#0f172a", color: "#fff" }}
        >
          <option value="">Criticality</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          value={filters.env}
          onChange={(e) => handleFilterChange("env", e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #334155", background: "#0f172a", color: "#fff" }}
        >
          <option value="">Status</option>
          <option  value="Operational">Operational</option>
          <option value="Non-Operational">Non-Operational</option>
          <option value="Retired">Retired</option>
        </select> 
      </div>

      {error && <div style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</div>}

      <div style={{ background: "#0f172a", borderRadius: "8px", overflow: "hidden", border: "1px solid #334155" }}>
        {loading ? (
          <p style={{ padding: "20px", color: "#94a3b8" }}>Loading CIs...</p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#1e293b", borderBottom: "2px solid #334155" }}>
                  <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Name</th>
                  <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Environment</th>
                  <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Asset Tag</th>
                  <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Operational Status</th>
                  <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Criticality</th>
                  <th style={{ ...cellStyle, color: "white", fontWeight: "bold", borderRight: "none" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cis.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                      No configuration items found.
                    </td>
                  </tr>
                ) : (
                  cis.map((ci, index) => (
                    <tr
                      key={ci._id}
                      style={{
                        background: index % 2 === 0 ? "#081124" : "#1f2937"
                      }}
                    >
                      <td style={cellStyle}>
                        <Link to={`/cmdb/ci/${ci._id}`} style={{ fontWeight: "bold", color: "#38bdf8", textDecoration: "none" }}>
                          {ci.name}
                        </Link>
                      </td>
                      <td style={{ ...cellStyle, color: "#f1f5f9" }}>{ci.environment || "N/A"}</td>
                      <td style={{ ...cellStyle, color: "#f1f5f9" }}>{ci.asset_tag || "N/A"}</td>
                      <td style={{ ...cellStyle, color: "#f1f5f9" }}>{ci.operational_status || "N/A"}</td>
                      <td style={{ ...cellStyle, color: "#f1f5f9" }}>{ci.business_criticality || "Normal"}</td>
                      <td style={{ ...cellStyle, borderRight: "none" }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                          <Link to={`/cmdb/ci/${ci._id}`} style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "600" }}>
                            View
                          </Link>
                          <Link to={`/cmdb/edit/${ci._id}`} style={{ color: "#fbbf24", textDecoration: "none", fontWeight: "600" }}>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(ci._id, ci.name)}
                            style={{
                              background: "#dc2626",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 10px",
                              cursor: "pointer"
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#1e293b" }}>
                <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, cis.length)} of {cis.length} CIs
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    style={{ padding: "6px 12px", background: currentPage === 1 ? "#334155" : "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                  >
                    Previous
                  </button>
                  <span style={{ padding: "0 8px", color: "#e2e8f0" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    style={{ padding: "6px 12px", background: currentPage === totalPages ? "#334155" : "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}