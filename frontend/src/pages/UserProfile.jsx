import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
// import api from "../api/api";
import apiClient from "../api/apiClient";

export default function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  if (!user) {
    return (
      <MainLayout>
        <p>Loading profile...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="profile-page">

        {/* Watermark */}
        <div className="page-watermark">
          <img src="/s3-watermark.png" alt="S3 Technologies" />
        </div>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information and account settings</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">

          <div className="profile-avatar">
            <img src="/avatar-default.png" alt="User Avatar" />
          </div>

          <div className="profile-info">
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            <p className="profile-role">{user.role}</p>
          </div>

        </div>

        {/* Details Section */}
        <div className="profile-details-card">
          <h2>Account Details</h2>

          <div className="profile-details-grid">
            <div>
              <label>Full Name</label>
              <p>{user.name}</p>
            </div>

            <div>
              <label>Email</label>
              <p>{user.email}</p>
            </div>

            <div>
              <label>Role</label>
              <p>{user.role}</p>
            </div>

            <div>
              <label>Department</label>
              <p>{user.department || "Not Assigned"}</p>
            </div>

            <div>
              <label>Last Login</label>
              <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</p>
            </div>

            <div>
              <label>Account Status</label>
              <p className={`status-tag ${user.active ? "status-active" : "status-disabled"}`}>
                {user.active ? "Active" : "Disabled"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
