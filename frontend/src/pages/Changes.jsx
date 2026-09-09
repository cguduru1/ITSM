import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ModuleSwitcher from "../components/ModuleSwitcher";

export default function Changes() {
  const [changes, setChanges] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState([]);

  const pageSize = 5;
  const navigate = useNavigate();

  const loadChanges = async () => {
    try {
      const res = await api.get("/changes", {
        params: { search, status, page, pageSize }
      });

      setChanges(res.data.table);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadChanges();
  }, [search, status, page]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteChange = async (id) => {
    if (!confirm("Are you sure you want to delete this change?")) return;

    try {
      await api.delete(`/changes/${id}`);
      loadChanges();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return alert("Select at least one change");

    try {
      for (let id of selected) {
        await api.delete(`/changes/${id}`);
      }
      setSelected([]);
      loadChanges();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  const viewSelected = () => {
    if (selected.length !== 1)
      return alert("Select exactly one change to view");

    navigate(`/changes/details/${selected[0]}`);
  };

  const editSelected = () => {
    if (selected.length !== 1)
      return alert("Select exactly one change to edit");

    navigate(`/changes/${selected[0]}`);
  };

  return (
    <MainLayout>
            <div className="page-container">

        <ModuleSwitcher />
      <div className="changes-page">

        {/* Header */}
        <div className="page-header">
          <h1>Changes</h1>
          <p>Track all change requests across your IT landscape</p>

          <button className="btn-primary" onClick={() => navigate("/changes/new")}>
            + Create Change
          </button>
        </div>

        {/* Search + Filters */}
        <div className="changes-filters">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Actions */}
        <div className="changes-actions">
          <button className="btn-danger" onClick={editSelected}>Edit</button>
          <button className="btn-danger" onClick={deleteSelected}>Delete</button>
        </div>

        {/* Table */}
        <table className="changes-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Title</th>
              <th>Status</th>
              <th>Requested By</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {changes.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-row">
                  No change requests found
                </td>
              </tr>
            )}

            {changes.map((c) => (
              <tr key={c._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(c._id)}
                    onChange={() => toggleSelect(c._id)}
                  />
                </td>

                <td>{c.title}</td>
                <td>{c.status}</td>
                <td>{c.requestedBy}</td>
                <td>{c.description || "No description"}</td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>

          <span>Page {page} of {totalPages}</span>

          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>

      </div>
      </div>
    </MainLayout>
  );
}
