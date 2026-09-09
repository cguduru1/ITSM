import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import "../styles/ticket.css";

export default function CMDBPermissionAdmin() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(["admin", "cmdb_manager", "cmdb_viewer"]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch users and CMDB permissions in parallel
        const [usersRes, permRes] = await Promise.allSettled([
          apiClient.get("/api/users"),
          apiClient.get("/api/cmdb/permissions")
        ]);

        if (usersRes.status === "fulfilled") {
          const userData = usersRes.value?.data || usersRes.value || [];
          setUsers(Array.isArray(userData) ? userData : []);
        }

        if (permRes.status === "fulfilled") {
          const permData = permRes.value?.data || permRes.value || [];
          setPermissions(Array.isArray(permData) ? permData : []);
        }
      } catch (err) {
        console.error("Failed to load admin panel data:", err);
        setError("Failed to load permission management data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const updateRole = async (userId, role) => {
    try {
      await apiClient.put(`/api/users/${userId}/role`, { role });
      setUsers(prevUsers =>
        prevUsers.map(u => (u._id === userId ? { ...u, role } : u))
      );
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert("Failed to update user role. Please try again.");
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading permission controls...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  return (
    <div className="cmdb-panel quantum">
       <div className="ticket-header">
      <h1>CMDB Permission Admin</h1>
      <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
        ← Back to Dashboard
      </Link>
    </div>


      {users.length === 0 ? (
        <p style={{ padding: "10px" }}>No users found.</p>
      ) : (
        <div className="quantum-card quantum-table-container">
      <table
          className="quantum-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #334155"
          }}
        >
        <thead>
          <tr style={{ background: "#0f172a" }}>
              <th style={{ color: "#FFD700", fontWeight: "700", border: "1px solid #334155", padding: "8px" }}>
                User
              </th>
              <th style={{ color: "#FFD700", fontWeight: "700", border: "1px solid #334155", padding: "8px" }}>
                Current Role
              </th>
              <th style={{ color: "#FFD700", fontWeight: "700", border: "1px solid #334155", padding: "8px" }}>
                Assign Role
              </th>
            </tr>
        </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr
                key={u._id}
                style={{
                  background: idx % 2 === 0 ? "#1e293b" : "#0f172a",
                  color: "#e2e8f0"
                }}
              >
                <td style={{ border: "1px solid #334155", padding: "8px" }}>
                  {u.name || u.email || "Unnamed User"}
                </td>
                <td style={{ border: "1px solid #334155", padding: "8px" }}>
                  {u.role || "N/A"}
                </td>
                <td style={{ border: "1px solid #334155", padding: "8px" }}>
                  <select
                    className="quantum-input"
                    value={u.role || "cmdb_viewer"}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
}
