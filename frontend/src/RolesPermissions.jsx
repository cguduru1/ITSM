import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function RolesPermissions() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/roles");
        setRoles(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <MainLayout>
      <div className="roles-page">

        {/* Watermark */}
        <div className="page-watermark">
          <img src="/s3-watermark.png" alt="S3 Technologies" />
        </div>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Roles & Permissions</h1>
          <p className="page-subtitle">
            Define access levels and manage permissions for all user roles
          </p>

          <button className="btn-primary">+ Add Role</button>
        </div>

        {/* Roles Table */}
        <div className="roles-table-card">
          <table className="roles-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Users Assigned</th>
              </tr>
            </thead>

            <tbody>
              {roles.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{r.description || "—"}</td>
                  <td>
                    <ul className="perm-list">
                      {r.permissions.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{r.userCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </MainLayout>
  );
}
