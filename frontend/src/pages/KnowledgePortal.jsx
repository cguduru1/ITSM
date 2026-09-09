// src/pages/KnowledgePortal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import "../styles/knowledge.css";

// Preset categories with icons
const CATEGORY_CONFIG = [
  { name: "IT", icon: "💻", description: "Hardware, software, networks, and technical support" },
  { name: "HR", icon: "👥", description: "Company policies, benefits, and employee relations" },
  { name: "FAQ", icon: "❓", description: "Frequently asked questions and quick answers" },
  { name: "Troubleshooting", icon: "🔧", description: "Step-by-step guides to fix common technical issues" },
  { name: "Policy", icon: "📜", description: "Official workplace guidelines and security rules" },
];

export default function KnowledgePortal() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/kb?status=Published");
        const data = res?.articles || res?.data || res || [];
        setArticles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("KB load error:", err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Helper function to sanitize text preview (removes HTML tags & &nbsp;)
  const getCleanSnippet = (htmlString) => {
    if (!htmlString) return "";
    const cleanText = htmlString
      .replace(/<[^>]*>?/gm, "") // Removes HTML tags
      .replace(/&nbsp;/g, " ")   // Replaces non-breaking spaces
      .replace(/\s+/g, " ");     // Normalizes whitespace
    return cleanText.length > 120 ? `${cleanText.slice(0, 120)}...` : cleanText;
  };

  // Filter articles based on search query
  const filteredArticles = articles.filter((a) => {
    const searchLower = query.toLowerCase();
    const titleMatch = a.title?.toLowerCase().includes(searchLower);
    const contentMatch = a.content?.toLowerCase().includes(searchLower);
    const tagMatch = (a.tags || []).some((t) => t.toLowerCase().includes(searchLower));
    return titleMatch || contentMatch || tagMatch;
  });

  return (
    <div className="knowledge-root" style={{ padding: "20px" }}>

      {/* Header */}
      <div className="knowledge-header" style={{ marginBottom: "24px" }}>
        <h1>📚 Knowledge Portal</h1>
        <input
          className="knowledge-search"
          placeholder="Search articles, tags, or content..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: "100%", maxWidth: "400px", padding: "10px", borderRadius: "6px" }}
        />
      </div>

      {/* Navigation Tiles */}
      <div className="knowledge-actions" style={{ marginBottom: "32px" }}>

        <div className="kb-action-item" onClick={() => navigate("/kb/new")}>
          <span className="icon">✏️</span>
          <span className="icon-hover" style={{ opacity: 0 }}>🆕</span>
          <span>Create Article</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-category/all")}>
          <span className="icon">🗂</span>
          <span className="icon-hover" style={{ opacity: 0 }}>📁</span>
          <span>Categories</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-ops")}>
          <span className="icon">🔧</span>
          <span className="icon-hover" style={{ opacity: 0 }}>⚙️</span>
          <span>Knowledge Ops</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-ops/analytics")}>
          <span className="icon">📊</span>
          <span className="icon-hover" style={{ opacity: 0 }}>📈</span>
          <span>Analytics Dashboard</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-ops/category-health")}>
          <span className="icon">📉</span>
          <span className="icon-hover" style={{ opacity: 0 }}>📊</span>
          <span>Category Health</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-ops/ai-insights")}>
          <span className="icon">🤖</span>
          <span className="icon-hover" style={{ opacity: 0 }}>🧠</span>
          <span>AI Insights</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-ops/workflow")}>
          <span className="icon">🔄</span>
          <span className="icon-hover" style={{ opacity: 0 }}>⚙️</span>
          <span>Workflow Queue</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-ops/versioning")}>
          <span className="icon">🧬</span>
          <span className="icon-hover" style={{ opacity: 0 }}>📘</span>
          <span>Versioning</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-ops/attachments")}>
          <span className="icon">📂</span>
          <span className="icon-hover" style={{ opacity: 0 }}>🗂</span>
          <span>Attachments Manager</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-ops/expiry")}>
          <span className="icon">⏳</span>
          <span className="icon-hover" style={{ opacity: 0 }}>⌛</span>
          <span>Expiry Monitor</span>
        </div>

        <div className="kb-action-item" onClick={() => navigate("/kb-ops/my-contributions")}>
          <span className="icon">🧠</span>
          <span className="icon-hover" style={{ opacity: 0 }}>📘</span>
          <span>My Contributions</span>
        </div>
      </div>

{/* CATEGORY CARDS SECTION (When search query is empty) */}
      {!query.trim() ? (
        <>
          <h2 style={{ marginBottom: "16px" }}>Knowledge Categories</h2>
          <div className="knowledge-grid">
            {CATEGORY_CONFIG.map((cat) => {
              // Count how many articles belong to this category
              const count = articles.filter(
                (a) => (a.category || "").toUpperCase() === cat.name.toUpperCase()
              ).length;

              return (
                <div
                  key={cat.name}
                  className="knowledge-card quantum"
                  onClick={() => navigate(`/kb-category/${cat.name}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{cat.icon}</div>
                  <h2>{cat.name}</h2>
                  <p>{cat.description}</p>
                  <div className="knowledge-card-footer" style={{ marginTop: "12px", opacity: 0.8 }}>
                    <small>📄 {count} {count === 1 ? "article" : "articles"}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* SEARCH RESULTS SECTION (Shows matching articles when user types in search box) */
        <>
          <h2 style={{ marginBottom: "16px" }}>Search Results ({filteredArticles.length})</h2>
          <div className="knowledge-grid">
            {loading ? (
              <p>Searching records...</p>
            ) : filteredArticles.length === 0 ? (
              <p>No articles found matching "{query}".</p>
            ) : (
              filteredArticles.map((article) => {
                const articleId = article._id || article.id;
                return (
                  <div
                    key={articleId}
                    className="knowledge-card quantum"
                    onClick={() => navigate(`/kb/${articleId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="badge" style={{ fontSize: "11px", opacity: 0.7 }}>
                      {article.category || "General"}
                    </span>
                    <h2>{article.title}</h2>
                    <p>{getCleanSnippet(article.content)}</p>
                    <div className="knowledge-tags">
                      {(article.tags || []).map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}