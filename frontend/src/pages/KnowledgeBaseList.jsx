import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { Link } from "react-router-dom";

export default function KnowledgeBaseList() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    try {
      // 1. Changed 'api' to 'apiClient'
      // 2. Removed '.data' because apiClient returns the parsed JSON array directly
    const res = await apiClient.get(`/api/kb?search=${search}&category=${category}`);

    const articlesList = Array.isArray(res) ? res : res?.data || [];
    setArticles(articlesList.filter(a => a.status !== "Archived"));
    } catch (err) {
      console.error("Failed to load knowledge base articles:", err);
      setArticles([]);
    }
  };

  useEffect(() => { load(); }, [search, category]);

  return (
    <div className="page-container">
      <h2>Knowledge Base</h2>

      <div className="filters">
        <input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="FAQ">FAQ</option>
          <option value="Troubleshooting">Troubleshooting</option>
          <option value="Policy">Policy</option>
        </select>

        <Link to="/kb/new" className="btn-primary">Create Article</Link>
      </div>

      <div className="kb-list">
        {articles.map(a => (
          <Link key={a._id} to={`/kb/${a._id}`} className="kb-card">
            <h3>{a.title}</h3>
            <p>{a.category}</p>
            <span>{a.views || 0} views</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
