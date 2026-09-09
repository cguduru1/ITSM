import { useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  const search = async (value) => {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      const res = await api.get(`/search?q=${value}`);
      setResults(res.data);
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="global-search">

      {/* Search Input */}
      <input
        className="global-search-input"
        placeholder="Search tickets, assets, changes, CMDB, KB..."
        value={query}
        onChange={(e) => search(e.target.value)}
        onFocus={() => setOpen(true)}
      />

      {/* Results Dropdown */}
      {open && (
        <div className="global-search-results">
          {results.length === 0 && (
            <p className="search-empty">No results found</p>
          )}

          {results.map((r, i) => (
            <a
              key={i}
              href={r.url}
              className="search-item"
              onClick={() => setOpen(false)}
            >
              <div className="search-icon">
                <i className={r.icon}></i>
              </div>

              <div className="search-info">
                <h4>{r.title}</h4>
                <p>{r.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      )}

    </div>
  );
}
