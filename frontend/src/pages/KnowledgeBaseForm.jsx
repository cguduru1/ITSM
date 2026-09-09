import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../api/apiClient";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function KnowledgeBaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read URL param (e.g. /kb/new?category=IT) or fallback to "IT"
  const urlCategory = searchParams.get("category") || "IT";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Published");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // If editing existing article (ID present), fetch data
  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      setFetching(true);
      try {
        const res = await apiClient.get(`/api/kb/${id}`);
        const data = res?.article || res?.data || res;
        if (data) {
          setTitle(data.title || "");
          setContent(data.content || "");
          setCategory(data.category || urlCategory);
          setStatus(data.status || "Published");
        }
      } catch (err) {
        console.error("Failed to load article:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchArticle();
  }, [id, urlCategory]);

  const save = async (e) => {
    e.preventDefault();

    // Ensure category is never empty
    const cleanCategory = (category || urlCategory || "IT").trim();

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        category: cleanCategory,
        status, // Express default: "Published"
      };

      if (id) {
        // Update existing article
        await apiClient.put(`/api/kb/${id}`, payload);
        alert("Article updated successfully!");
      } else {
        // Create new article
        await apiClient.post("/api/kb", payload);
        alert("Article created successfully!");
      }

      // Redirect back to the specific category page
      navigate(`/kb-category/${encodeURIComponent(cleanCategory)}`);
    } catch (err) {
      console.error("Failed to save article:", err);
      alert(err.message || "Failed to save article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="page-container"><p>Loading article data...</p></div>;
  }

return (
  <div className="quantum-panel">
    <form onSubmit={save} className="page-container" style={{ padding: "20px" }}>
      <div className="ticket-header">
      <h1 >{id ? "✏️ Edit Knowledge Base Article" : "➕ Create Knowledge Base Article"}</h1>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={inputStyle}
      />

     <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={selectStyle}
        >
        <option value="IT">IT</option>
        <option value="HR">HR</option>
        <option value="FAQ">FAQ</option>
        <option value="Troubleshooting">Troubleshooting</option>
        <option value="Policy">Policy</option>
      </select>

      <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

       <div style={{ marginBottom: "15px", background: "#0f172a", borderRadius: "8px", padding: "8px" }}>
          <ReactQuill theme="snow" value={content} onChange={setContent} />
      </div>

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
       <button type="submit" style={btnPrimary} disabled={loading}>
          {loading ? "Saving..." : id ? "Update Article" : "Save Article"}
      </button>
       <button
          type="button"
          style={btnSecondary}
          onClick={() => navigate(`/kb-category/${category || "IT"}`)}
        >
          Cancel
        </button>
        </div>
    </form>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#f8fafc",
  fontSize: "14px"
};

const selectStyle = {
  padding: "10px",
  minWidth: "150px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#f8fafc",
  fontSize: "14px"
};

const btnPrimary = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: "600",
  cursor: "pointer"
};

const btnSecondary = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "1px solid #64748b",
  background: "#1e293b",
  color: "#f8fafc",
  fontWeight: "600",
  cursor: "pointer"
};
