// src/pages/KnowledgeCategoryDashboard.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import "../styles/kbPortal.css";
import "../styles/cmdb.css";

export default function KnowledgeCategoryDashboard() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);


  const fetchCategoryArticles = async () => {
    try {
      setLoading(true);
      const targetCategory = !category || category.toLowerCase() === "all" ? "" : category;
      const url = targetCategory ? `/api/kb?category=${encodeURIComponent(targetCategory)}` : "/api/kb";
      
      const res = await apiClient.get(url);
      const data = res?.articles || res?.data || res || [];
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryArticles();
  }, [category]);

  const getCleanSnippet = (article) => {
    const rawText = article.content || article.summary || "";
    const cleanText = rawText
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ");
    return cleanText.length > 70 ? `${cleanText.slice(0, 70)}...` : cleanText;
  };

  const handleDelete = async (e, articleId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    try {
      await apiClient.del(`/api/kb/${articleId}`);
      setArticles((prev) => prev.filter((a) => (a._id || a.id) !== articleId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete article.");
    }
  };

  const displayedArticles = [...articles].sort((a, b) => {
    if (activeTab === "views") return (b.views || 0) - (a.views || 0);
    if (activeTab === "updatedAt") {
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    }
    return 0;
  });

  

//   return (
//     <div className="kb-category-root" style={{ padding: "20px" }}>
//       <h1 style={{ textTransform: "capitalize" }}>{category} Knowledge</h1>

//       {/* Interactive Tile Controls */}
//       {/* Control Toolbar */}
//       <div className="kb-tile-grid" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
//         <button
//           type="button"
//           className={`kb-tile quantum ${activeTab === "all" ? "active" : ""}`}
//           onClick={() => setActiveTab("all")}
//         >
//           <span className="kb-tile-icon">📚</span>
//           <span className="kb-tile-label">All Articles</span>
//         </button>

//         <button
//           type="button"
//           className={`kb-tile quantum ${activeTab === "views" ? "active" : ""}`}
//           onClick={() => setActiveTab("views")}
//         >
//           <span className="kb-tile-icon">🔥</span>
//           <span className="kb-tile-label">Top Viewed</span>
//         </button>

//         <button
//           type="button"
//           className={`kb-tile quantum ${activeTab === "updatedAt" ? "active" : ""}`}
//           onClick={() => setActiveTab("updatedAt")}
//         >
//           <span className="kb-tile-icon">⏱</span>
//           <span className="kb-tile-label">Recently Updated</span>
//         </button>

//         {/* Create button rendered conditionally based on admin status */}
//         {isAdmin && (
//           <button
//           type="button"
//           className="kb-tile quantum"
//           onClick={() => navigate(`/kb/new?category=${encodeURIComponent(category || "IT")}`)}
//         >
//             <span className="kb-tile-icon">➕</span>
//             <span className="kb-tile-label">Create Article</span>
//           </button>
//         )}
//       </div>

//       {/* Table Format View */}
//       {loading ? (
//         <p>Loading {category} records...</p>
//       ) : displayedArticles.length === 0 ? (
//         <p>No articles found in {category}.</p>
//       ) : (
//         <div style={{ overflowX: "auto", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
//           <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
//             <thead>
//               <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", padding: "12px" }}>
//                 <th style={{ padding: "12px" }}>Title</th>
//                 <th style={{ padding: "12px" }}>Category</th>
//                 <th style={{ padding: "12px" }}>Snippet</th>
//                 <th style={{ padding: "12px" }}>Views</th>
//                 <th style={{ padding: "12px" }}>Date</th>
//                 <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {displayedArticles.map((article) => {
//                 const articleId = article._id || article.id;
//                 return (
//                   <tr
//                     key={articleId}
//                     style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}
//                     onClick={() => navigate(`/kb/${articleId}`)}
//                   >
//                     <td style={{ padding: "12px", fontWeight: "bold" }}>{article.title}</td>
//                     <td style={{ padding: "12px" }}>{article.category || "General"}</td>
//                     <td style={{ padding: "12px", opacity: 0.8 }}>{getCleanSnippet(article)}</td>
//                     <td style={{ padding: "12px" }}>👁️ {article.views || 0}</td>
//                     <td style={{ padding: "12px" }}>
//                       {new Date(article.updatedAt || article.createdAt || Date.now()).toLocaleDateString()}
//                     </td>
//                     <td style={{ padding: "12px", textAlign: "right" }}>

//                       {/* Edit Button */}
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           navigate(`/kb/edit/${articleId}`);
//                         }}
//                         style={{ marginRight: "8px", cursor: "pointer", padding: "4px 8px" }}
//                       >
//                         ✏️ Edit
//                       </button>

//                       {/* Delete Button */}
//                       <button
//                         type="button"
//                         onClick={(e) => handleDelete(e, articleId)}
//                         style={{ cursor: "pointer", padding: "4px 8px", color: "red" }}
//                       >
//                         🗑️ Delete
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//           </div>
//       )}
//     </div>
//   );
// }

const cellStyle = {
    padding: "12px 16px",
    verticalAlign: "middle",
    // borderBottom: "1px solid #334155",
    // borderRight: "1px solid #334155"
    borderBottom: "1px solid #e2e8f0",
  borderRight: "1px solid #e2e8f0",
  fontSize: "14px",
  };

return (
  <div className="cmdb-root" style={{ padding: "20px", color: "#f8fafc" }}>
    <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif" }}>
      <div className="ticket-header">
        <h1 style={{ color: "#ffffff" }}>
        Knowledge Base
        </h1>
        <p>Browse Knowledge Article</p>
      </div>

      {/* Action Toolbar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("all")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            background: activeTab === "all" ? "#2563eb" : "#ffffff",
            color: activeTab === "all" ? "#ffffff" : "#334155",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          📚 All Articles
        </button>
        <button
          onClick={() => setActiveTab("views")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            background: activeTab === "views" ? "#2563eb" : "#ffffff",
            color: activeTab === "views" ? "#ffffff" : "#334155",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          🔥 Top Viewed
        </button>
        <button
          onClick={() => navigate(`/kb/new?category=${encodeURIComponent(category || "IT")}`)}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: "#16a34a",
            color: "#ffffff",
            cursor: "pointer",
            fontWeight: "600",
            marginLeft: "auto"
          }}
        >
          ➕ Create Article
        </button>
      </div>

      {/* Styled Data Table */}
      {loading ? (
        <p>Loading records...</p>
      ) : displayedArticles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
              <tr style={{ background: "#1e293b", borderBottom: "2px solid #334155" }}>
                <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Title</th>
                <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Category</th>
                <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Description</th>
                <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Views</th>
                <th style={{ ...cellStyle, color: "white", fontWeight: "bold" }}>Date</th>
                <th style={{ ...cellStyle, color: "white", fontWeight: "bold", borderRight: "none" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedArticles.map((article, index) => {
                const articleId = article._id || article.id;
                // Alternating row background colors (Zebra Striping)
                const rowBg = index % 2 === 0 ? "#ffffff" : "#f1f5f9";

                return (
                  <tr
                    key={articleId}
                    style={{
                      // background: rowBg,
                      background: index % 2 === 0 ? "#081124" : "#1f2937",
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.2s"
                    }}
                    // onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                    // onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                  >
                    <td style={{ ...cellStyle, color: "#f1f5f9" }}>{article.title}</td>
                    <td style={{ ...cellStyle, color: "#f1f5f9" }}>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" }}>
                        {article.category || "General"}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, color: "#f1f5f9" }}>{getCleanSnippet(article)}</td>
                    <td style={{ ...cellStyle, color: "#f1f5f9" }}>👁️ {article.views || 0}</td>
                    <td style={{ ...cellStyle, color: "#f1f5f9" }}>
                      {new Date(article.updatedAt || article.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td style={{ ...cellStyle, borderRight: "none" }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        {/* <button
                          type="button"
                          onClick={() => navigate(`/kb/edit/${articleId}`)}
                          style={{
                            padding: "6px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            background: "#ffffff",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#2563eb"
                          }}
                        >
                          
                          ✏️ Edit
                        </button> */}
                        <Link to={`/kb/edit/${articleId}`} style={{ color: "#fbbf24", textDecoration: "none", fontWeight: "600" }}>
                            Edit
                          </Link>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, articleId)}
                          style={{
                            padding: "6px 12px",
                            border: "1px solid #fca5a5",
                            borderRadius: "4px",
                            background: "#fef2f2",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#dc2626"
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  );
}