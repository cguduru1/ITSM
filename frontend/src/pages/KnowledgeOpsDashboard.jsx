// src/pages/KnowledgeOpsDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import KBQuantumHeader from "../components/kb/KBQuantumHeader";
import KBCategoryHealth from "../components/kb/KBCategoryHealth";
import KBAnalyticsPanel from "../components/kb/KBAnalyticsPanel";
import KBWorkflowQueue from "../components/kb/KBWorkflowQueue";
import KBVersionPanel from "../components/kb/KBVersionPanel";
import KBAttachmentManager from "../components/kb/KBAttachmentManager";
import KBAIInsights from "../components/kb/KBAIInsights";
import KBExpiryMonitor from "../components/kb/KBExpiryMonitor";
import KBBookmarksPanel from "../components/kb/KBBookmarksPanel";
import KBMyContributions from "../components/kb/KBMyContributions";
import KBAuditViewer from "../components/KBAuditViewer";
import "../styles/kbOps.css";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";
import "../styles/cmdb.css";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export default function KnowledgeOpsDashboard() {
  // Safely extract auth context
  const auth = useAuth() || {};
  const user = auth.user;

// Fix 1: Consolidated theme state
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dashboard Data State
  const [analytics, setAnalytics] = useState({ byStatus: [], topViewed: [], topHelpful: [] });
  const [workflow, setWorkflow] = useState([]);
  const [versions, setVersions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [expiry, setExpiry] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [myContrib, setMyContrib] = useState([]);

  const isKbAdmin =
    user?.role === "admin" ||
    user?.permissions?.kb?.includes("admin");

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        
        // Fix 2: Fetch all components including contributions & versions
        const [a, w, i, e, b, v, c] = await Promise.allSettled([
          apiClient.get("/api/kb/analytics"),
          apiClient.get("/api/kb/workflow"),
          apiClient.get("/api/kb/insights"),
          apiClient.get("/api/kb/expiry-monitor"),
          apiClient.get("/api/kb/bookmarks"),
          apiClient.get("/api/kb/versions"),
          apiClient.get("/api/kb/my-contributions")
        ]);

        // Fix 3: Safely unwrap Axios response payloads (.data)
        if (a.status === "fulfilled" && a.value) setAnalytics(a.value.data || a.value);
        if (w.status === "fulfilled" && w.value) setWorkflow(w.value.data || w.value);
        if (i.status === "fulfilled" && i.value) setInsights(i.value.data || i.value);
        if (e.status === "fulfilled" && e.value) setExpiry(e.value.data || e.value);
        if (b.status === "fulfilled" && b.value) setBookmarks(b.value.data || b.value);
        if (v.status === "fulfilled" && v.value) setVersions(v.value.data || v.value);
        if (c.status === "fulfilled" && c.value) setMyContrib(c.value.data || c.value);
      } catch (err) {
        console.error("Dashboard data initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // Sync DOM classes for theme toggling
  useEffect(() => {
    if (isDark) {
      document.body.classList.add("kb-dark");
      document.body.classList.remove("kb-light");
    } else {
      document.body.classList.add("kb-light");
      document.body.classList.remove("kb-dark");
    }
  }, [isDark]);

  if (loading) return <div className="loading-spinner">Loading Operations Dashboard...</div>;
  //       const res = await apiClient.get("/api/kb/analytics");
  //       if (res) {
  //         setData({
  //           byStatus: res.byStatus || [],
  //           topViewed: res.topViewed || [],
  //           topHelpful: res.topHelpful || []
  //         });
  //       }
  //     } catch (err) {
  //       console.error("Dashboard analytics load failed:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadDashboard();
  // }, []);

  // if (loading) return <div>Loading Analytics...</div>;

  // const loadAll = async () => {
  //   const a = await apiClient.get("/api/kb/analytics");
  //   const w = await apiClient.get("/api/kb/workflow");
  //   const i = await apiClient.get("/api/kb/insights");
  //   const e = await apiClient.get("/api/kb/expiry-monitor");
  //   const b = await apiClient.get("/api/kb/bookmarks");

  //   setAnalytics(a.data);
  //   setWorkflow(w.data);
  //   setInsights(i.data);
  //   setExpiry(e.data);
  //   setBookmarks(b.data);
  // };

  return (
     <div className={`kb-ops-container ${isDark ? "kb-dark" : "kb-light"}`}>

      {/* Pass unified state setter to header */}
      <KBQuantumHeader onToggleDark={() => setIsDark((prev) => !prev)} />

      <div>
        <h1>Knowledge Ops Dashboard</h1>
        <Link to="/kb" className="quantum-link">
                                  ← Back to Dashboard
                </Link>
        {isKbAdmin ? (
          <p className="status-admin">Welcome KB Admin</p>
        ) : (
          <p className="status-restricted">You have view-only access</p>
        )}

      </div>

      <motion.div
        className="kb-ops-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
      <div className="kb-ops-grid">
        <KBCategoryHealth analytics={analytics} />
        <KBAnalyticsPanel analytics={analytics} />
        <KBWorkflowQueue items={workflow} />
        <KBVersionPanel versions={versions} />
        <KBAttachmentManager />
        <KBAIInsights insights={insights} />
        <KBExpiryMonitor expiry={expiry} />
        <KBAuditViewer />
        <KBBookmarksPanel bookmarks={bookmarks} />
        
        {user?.permissions?.kb?.includes("read") && (
          <KBMyContributions data={myContrib} />  
        )}
      </div>
      </motion.div>
    </div>
  );
}
