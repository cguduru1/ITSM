import { useEffect, useState } from "react";
// import api from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import apiClient from "../api/apiClient";

export default function KBArticleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [kb, setKb] = useState(null);
  const [file, setFile] = useState(null);

  //Load Article
  useEffect(() => {
    api.get(`/kb/${id}`)
      .then(res => setKb(res.data))
      .catch((err) => console.error("LOAD ERROR:", err));
  }, [id]);

    if (!kb) {
    return (
      <MainLayout>
        <p>Loading article...</p>
      </MainLayout>
    );
  }

  //Update Article
  const saveArticle = async () => {
    try {
      const res = await api.put(`/kb/${id}`, kb);
      setKb(res.data);
      alert("Article updated successfully");

      // Redirect to main KB page
      navigate("/kb");
      
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      alert("Failed to update article");
    }
  };

//Upload Attachments
  const uploadAttachment = async () => {
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await api.post(`/kb/${id}/attachment/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setKb(res.data);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Failed to upload attachment");
    }
  };

  //Delete Attachment
  const deleteAttachment = async (attId) => {
    try {
      const res = await api.delete(`/kb/${id}/attachment/${attId}`);
      setKb(res.data);
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  //Helpful Vote
  const markHelpful = async () => {
    try {
      const res = await api.post(`/kb/${id}/helpful`);
      setKb(res.data);
    } catch (err) {
      console.error("HELPFUL ERROR:", err);
    }
  };

  if (!kb) return <div>Loading...</div>;

  return (
    <MainLayout>
      <div className="kb-details-page">

        <h1>{kb.title}</h1>

        <button onClick={saveArticle} className="btn-primary">Save</button>
        <button onClick={markHelpful} className="btn-secondary">👍 Helpful</button>

        {/* Editable Fields */}
        <div className="form-row">
          <label>Title</label>
          <input
            value={kb.title}
            onChange={(e) => setKb({ ...kb, title: e.target.value })}
          />
        </div>

        <div className="form-row">
          <label>Summary</label>
          <input
            value={kb.summary}
            onChange={(e) => setKb({ ...kb, summary: e.target.value })}
          />
        </div>

        <div className="form-row">
          <label>Category</label>
          <select
            value={kb.category}
            onChange={(e) => setKb({ ...kb, category: e.target.value })}
          >
            <option value="Networking">Networking</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Security">Security</option>
            <option value="Cloud">Cloud</option>
            <option value="ITSM">ITSM</option>
          </select>
        </div>

        <div className="form-row">
          <label>Author</label>
          <input
            value={kb.author}
            onChange={(e) => setKb({ ...kb, author: e.target.value })}
          />
        </div>

        <div className="form-row">
          <label>Content</label>
          <textarea
            rows="6"
            value={kb.content}
            onChange={(e) => setKb({ ...kb, content: e.target.value })}
          />
        </div>

        <div className="form-row">
          <label>Tags (comma separated)</label>
          <input
            value={kb.tags.join(", ")}
            onChange={(e) =>
              setKb({
                ...kb,
                tags: e.target.value.split(",").map((t) => t.trim()),
              })
            }
          />
        </div>

        {/* Attachments */}
        <h2>Attachments</h2>

        <div className="form-row">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={uploadAttachment}>Upload</button>
        </div>

        {kb.attachments?.length > 0 && (
          <ul>
            {kb.attachments.map((att) => (
              <li key={att._id}>
                <a href={att.url} target="_blank" rel="noreferrer">
                  {att.name}
                </a>
                <button
                  className="btn-danger"
                  onClick={() => deleteAttachment(att._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

      </div>
    </MainLayout>
  );
}
