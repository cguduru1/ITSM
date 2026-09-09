import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import "../styles/kbPortal.css";

export default function KnowledgeBaseDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    api.get(`/api/kb/${id}`).then(res => setArticle(res.data));
  }, [id]);

  if (!article) return <div>Loading...</div>;

  const sendFeedback = async (type) => {
  await api.post(`/api/kb/${id}/feedback`, { helpful: type });
  alert("Thanks for your feedback!");
};

const sendRating = async (star) => {
  await api.post(`/api/kb/${id}/rate`, { rating: star });
  alert("Thanks for rating!");
};

useEffect(() => {
  api.get(`/api/kb/${id}/suggested`).then(res => setSuggested(res.data));
}, [id]);

const toggleBookmark = async (id) => {
  if (isBookmarked)
    await api.post(`/api/kb/${id}/unbookmark`);
  else
    await api.post(`/api/kb/${id}/bookmark`);

  loadBookmarks();
};

  return (
    <div className="page-container">
      <h2>{article.title}</h2>
      <p><strong>Category:</strong> {article.category}</p>
      <p><strong>Views:</strong> {article.views}</p>

      <div dangerouslySetInnerHTML={{ __html: article.content }} />

      <div className="kb-feedback-box">
        <p>Was this article helpful?</p>

        <button onClick={() => sendFeedback("yes")} className="kb-feedback-yes">👍 Yes</button>
        <button onClick={() => sendFeedback("no")} className="kb-feedback-no">👎 No</button>
      </div>

      <div className="kb-rating-box">
        <p>Rate this article</p>

        {[1,2,3,4,5].map(star => (
          <span
            key={star}
            className="kb-star"
            onClick={() => sendRating(star)}
          >
          ⭐
          </span>
        ))}
      </div>

      <div className="kb-section">
        <h2>Suggested Articles</h2>
        <div className="kb-card-grid">
          {suggested.map(a => (
            <Link key={a._id} to={`/kb/${a._id}`} className="kb-card">
              <h3>{a.title}</h3>
              <p>{a.category}</p>
            </Link>
          ))}
        </div>
      </div>

      <button className="kb-bookmark-btn" onClick={() => toggleBookmark(article._id)}>
        {isBookmarked ? "⭐ Bookmarked" : "☆ Bookmark"}
      </button>

      <Link to={`/kb/edit/${article._id}`} className="btn-primary">Edit</Link>
    </div>
  );
}
