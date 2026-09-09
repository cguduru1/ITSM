import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
// import api from "../api/api";
import apiClient from "../api/apiClient";

export default function KBList() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    api.get("/kb")
      .then(res => setList(res.data))
      .catch(err => console.error(err));
  }, []);

  const filtered = list.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) &&
    (category === "" || item.category === category)
  );

  const categories = [...new Set(list.map(k => k.category))];

  return (
    <MainLayout>
      <div className="kb-list-page">

        <h1>Knowledge Base</h1>

        {/* Search */}
        <input
          className="kb-search"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category Filter */}
        <select
          className="kb-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        {/* List */}
        <div className="kb-list">
          {filtered.map(kb => (
            <Link to={`/kb/${kb._id}`} className="kb-item">
              <h3>{kb.title}</h3>
              <p>{kb.summary}</p>
              <span>{kb.category}</span>
            </Link>
          ))}
        </div>

        <Link to="/kb/new" className="btn-primary">Create Article</Link>

      </div>
    </MainLayout>
  );
}
