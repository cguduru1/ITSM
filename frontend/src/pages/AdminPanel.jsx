import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  return (
    <MainLayout>
      <div className="admin-page">

        {/* Watermark */}
        <div className="page-watermark">
          <img src="/s3-watermark.png" alt="S3 Technologies" />
        </div>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">
            Manage users, roles, permissions, system settings, and audit logs
          </p>
        </div>

        {/* Admin Grid */}
        <div className="admin-grid">

          <Link to="/admin/users" className="admin-card">
            <h3>User Management</h3>
            <p>Create, edit, disable, and manage user accounts.</p>
          </Link>

          <Link to="/admin/roles" className="admin-card">
            <h3>Roles & Permissions</h3>
            <p>Define access levels and assign permissions.</p>
          </Link>

          <Link to="/admin/audit" className="admin-card">
            <h3>Audit Logs</h3>
            <p>Track system activity and administrative actions.</p>
          </Link>

          <Link to="/admin/settings" className="admin-card">
            <h3>System Settings</h3>
            <p>Configure ITSM preferences, workflows, and integrations.</p>
          </Link>

        </div>

      </div>
    </MainLayout>
  );
}
