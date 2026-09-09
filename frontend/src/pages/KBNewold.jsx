import { useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function KBNew() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    summary: "",
    category: "",
    author: "",
    content: "",
    tags: "",
    file: null,
    attachments: [],
    helpfulVotes: 0
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const saveArticle = async () => {
    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        category: form.category,
        content: form.content,
        author: form.author,
        tags: form.tags.split(",").map(t => t.trim()),
        attachments: [],
        helpfulVotes: 0
      };

      // 1️⃣ Create article
      const res = await api.post("/kb", payload);

      const newId = res.data._id;

      // 2️⃣ Upload attachment if exists
      if (form.file) {
        const fd = new FormData();
        fd.append("file", form.file);

        const uploadRes = await api.post(`/kb/${newId}/attachment/upload`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // Update attachments list
        setForm(prev => ({
          ...prev,
          attachments: uploadRes.data.attachments
        }));
      }

      // 3️⃣ Redirect
      navigate("/kb");

    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Failed to save article");
    }
  };

  return (
    <div className="kb-new" style={{ width: "600px", margin: "auto" }}>
      <h1>Add New Article</h1>

      <div className="form-row">
        <label>Title</label>
        <input name="title" onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Summary</label>
        <input name="summary" onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Category</option>
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
        <input name="author" onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Content</label>
        <textarea name="content" rows="5" onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Tags (comma separated)</label>
        <input name="tags" onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Attachment</label>
        <input type="file" name="file" onChange={handleChange} />
      </div>

      {/* Show attachments if uploaded */}
      {form.attachments.length > 0 && (
        <div className="form-row">
          <label>Uploaded Attachments</label>
          {form.attachments.map(att => (
            <div key={att._id}>
              <a href={att.url} target="_blank">{att.name}</a>
            </div>
          ))}
        </div>
      )}

      {/* Helpful votes always start at 0 */}
      <div className="form-row">
        <label>Helpful Votes</label>
        <input value={form.helpfulVotes} disabled />
      </div>

      <button onClick={saveArticle} className="btn-primary">Save</button>
    </div>
  );
}
