import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import api from "../api/api";
import apiClient from "../api/apiClient";

import "../styles/kbPortal.css";

export default function KnowledgePortalHome() {
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    loadFeatured();
    loadRecent();
    loadPopular();
  }, []);

  const loadFeatured = async () => {
    const res = await api.get("/api/kb?featured=true");
    setFeatured(res.data);
  };

  const loadRecent = async () => {
    const res = await api.get("/api/kb?sort=updatedAt");
    setRecent(res.data.slice(0, 5));
  };

  const loadPopular = async () => {
    const res = await api.get("/api/kb?sort=views");
    setPopular(res.data.slice(0, 5));
  };

  return (
    <div className="kb-portal-root">

      {/* HERO SEARCH */}
      <div className="kb-hero">
        <h1>Knowledge Portal</h1>
        <p>Find answers, policies, troubleshooting guides and more</p>

        <div className="kb-search-box">
          <input
            type="text"
            placeholder="Search knowledge articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link to={`/kb?search=${search}`} className="kb-search-btn">Search</Link>
        </div>
      </div>

      {/* CATEGORY TILES */}
      <div className="kb-category-tiles">
        <Link to="/kb-category/IT" className="kb-tile it">💻 IT Support</Link>
        <Link to="/kb-category/HR" className="kb-tile hr">🧑‍💼 HR Policies</Link>
        <Link to="/kb-category/FAQ" className="kb-tile faq">❓ FAQ</Link>
        <Link to="/kb-category/Troubleshooting" className="kb-tile ts">🛠 Troubleshooting</Link>
        <Link to="/kb-category/Policy" className="kb-tile policy">📜 Policies</Link>
      </div>

      {/* FEATURED */}
      <div className="kb-section">
        <h2>Featured Articles</h2>
        <div className="kb-card-grid">
          {featured.map(a => (
            <Link key={a._id} to={`/kb/${a._id}`} className="kb-card">
              <h3>{a.title}</h3>
              <p>{a.category}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* POPULAR */}
      <div className="kb-section">
        <h2>Most Viewed</h2>
        <div className="kb-card-grid">
          {popular.map(a => (
            <Link key={a._id} to={`/kb/${a._id}`} className="kb-card">
              <h3>{a.title}</h3>
              <p>{a.views} views</p>
            </Link>
          ))}
        </div>
      </div>

      {/* RECENT */}
      <div className="kb-section">
        <h2>Recently Updated</h2>
        <div className="kb-card-grid">
          {recent.map(a => (
            <Link key={a._id} to={`/kb/${a._id}`} className="kb-card">
              <h3>{a.title}</h3>
              <p>Updated {new Date(a.updatedAt).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
