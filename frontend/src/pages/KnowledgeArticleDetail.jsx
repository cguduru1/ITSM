// src/pages/KnowledgeArticleDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import "../styles/knowledge.css";

export default function KnowledgeArticleDetail() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [versions, setVersions] = useState([]);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    api.get(`/api/knowledge/${id}`).then(res => setArticle(res.data));
    api.get(`/api/knowledge/${id}/versions`).then(res => setVersions(res.data));
    api.get(`/api/knowledge/${id}/similar`).then(res => setSimilar(res.data));
  }, [id]);

  if (!article) return null;

  const markHelpful = async () => {
    const res = await api.post(`/api/knowledge/${id}/feedback/helpful`);
    setArticle(res.data);
  };

  const markNotHelpful = async () => {
    const res = await api.post(`/api/knowledge/${id}/feedback/not-helpful`);
    setArticle(res.data);
  };

  return (
    <div className="knowledge-root">
      <div className="knowledge-header">
        <h1>{article.title}</h1>
        <p>Status: {article.status} · Version: {article.version}</p>
      </div>

      <div className="knowledge-card quantum">
        <h2>Content</h2>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />

        <h3>Tags</h3>
        <div className="knowledge-tags">
          {(article.tags || []).map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <h3>Attachments</h3>
        <ul>
          {(article.attachments || []).map(att => (
            <li key={att._id}>
              <a href={`/${att.path}`} target="_blank" rel="noreferrer">
                {att.filename}
              </a>
            </li>
          ))}
        </ul>

        <div className="knowledge-feedback">
          <button className="knowledge-btn" onClick={markHelpful}>
            👍 Helpful ({article.helpfulVotes})
          </button>

          <button className="knowledge-btn danger" onClick={markNotHelpful}>
            👎 Not Helpful ({article.notHelpfulVotes})
          </button>
        </div>
      </div>

      <div className="knowledge-card quantum">
        <h2>Version History</h2>
        <ul>
          {versions.map(v => (
            <li key={v._id}>
              <strong>Version {v.version}</strong> — {v.updatedByName}
              <p>{v.title}</p>
              <small>{new Date(v.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>

      <div className="knowledge-card quantum">
        <h2>Similar Articles</h2>
        <ul>
          {similar.map(s => (
            <li key={s._id}>
              <strong>{s.title}</strong>
              <p>{s.content.slice(0, 120)}...</p>
              <a href={`/knowledge/${s._id}`} className="knowledge-link">
                View Article
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
