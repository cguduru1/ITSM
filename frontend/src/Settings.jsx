import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function Settings() {
  const [settings, setSettings] = useState(null);

  const [theme, setTheme] = useState("light");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/settings");
        setSettings(res.data);

        setTheme(res.data.theme);
        setEmailNotif(res.data.emailNotifications);
        setSmsNotif(res.data.smsNotifications);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  const saveSettings = async () => {
    try {
      await api.post("/settings/update", {
        theme,
        emailNotifications: emailNotif,
        smsNotifications: smsNotif
      });

      alert("Settings updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update settings");
    }
  };

  if (!settings) {
    return (
      <MainLayout>
        <p>Loading settings...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="settings-page">

        <div className="page-watermark">
          <img src="/s3-watermark.png" alt="S3 Technologies" />
        </div>

        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your preferences and account configuration</p>
        </div>

        {/* Theme Settings */}
        <div className="settings-card">
          <h2>Appearance</h2>

          <div className="settings-row">
            <label>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <h2>Notifications</h2>

          <div className="settings-row">
            <label>Email Notifications</label>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={(e) => setEmailNotif(e.target.checked)}
            />
          </div>

          <div className="settings-row">
            <label>SMS Notifications</label>
            <input
              type="checkbox"
              checked={smsNotif}
              onChange={(e) => setSmsNotif(e.target.checked)}
            />
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-card">
          <h2>Security</h2>

          <div className="settings-row">
            <label>Password</label>
            <button className="btn-secondary">Change Password</button>
          </div>

          <div className="settings-row">
            <label>Active Sessions</label>
            <button className="btn-secondary">View Sessions</button>
          </div>
        </div>

        <button className="btn-primary save-btn" onClick={saveSettings}>
          Save Settings
        </button>

      </div>
    </MainLayout>
  );
}
