// src/components/kb/KBQuantumHeader.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function KBQuantumHeader({ onToggleDark = () => {} }) {  
  return (
    <div className="kb-header">
      <h1>🔮 Knowledge Ops Dashboard</h1>
      <p>Admin Command Center for Knowledge Lifecycle</p>

      <div className="kb-header-actions">
        <input className="kb-search" placeholder="Search articles, versions, contributors..." />
        <Link to="/kb/new" className="kb-btn">➕ Create Article</Link>
        <Link to="/kb" className="kb-btn">📚 Portal</Link>
        <Link to="/kb-category/IT" className="kb-btn">🗂 Category Dashboard</Link>
        <button 
          type="button" 
          className="kb-btn" 
          onClick={onToggleDark}
        >
          🌙 Dark / ☀️ Light
        </button> 
      </div>
    </div>
  );
}
