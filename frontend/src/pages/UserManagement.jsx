import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
// import api from "../api/api";
import apiClient from "../api/apiClient";

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <MainLayout>
      <div className="users-page">

        {/* Watermark */}
        <div className="page-watermark">
          <img src="/s3-watermark.png" alt="S3 Technologies" />
        </div>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Manage all users, roles, departments, and access levels
          </p>

          <button className="btn-primary">+ Add User</button>
        </div>

        {/* Users Table */}
        <div className="users-table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.department || "General"}</td>
                  <td>
                    <span className={`user-status status-${u.active ? "active" : "disabled"}`}>
                      {u.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    {u.lastLogin
                      ? new Date(u.lastLogin).toLocaleString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </MainLayout>
  );
}
