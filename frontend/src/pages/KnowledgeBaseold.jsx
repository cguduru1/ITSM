import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const navigate = useNavigate();

  // Load KB articles
  useEffect(() => {
    api
      .get(`/kb?category=${category}&q=${search}`)
      .then((res) => setArticles(res.data))
      .catch((err) => console.error("LOAD ERROR:", err));
  }, [category, search]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return alert("Select at least one article");

    try {
      for (let id of selected) {
        await api.delete(`/kb/${id}`);
      }

      setArticles(articles.filter((a) => !selected.includes(a._id)));
      setSelected([]);
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  const editSelected = () => {
    if (selected.length !== 1)
      return alert("Select exactly one article to edit");

    navigate(`/kb/${selected[0]}`);
  };

  const paginated = articles.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(articles.length / pageSize);

  // Export to Excel
  const exportExcel = () => {
  const rows = assets.map(a => ({
    Name: a.name,
    Type: a.type,
    Status: a.status,
    Owner: a.owner,
    Description: a.description
  }));

  let excelContent = "<table><tr>";

  Object.keys(rows[0]).forEach(key => {
    excelContent += `<th>${key}</th>`;
  });

  excelContent += "</tr>";

  rows.forEach(row => {
    excelContent += "<tr>";
    Object.values(row).forEach(val => {
      excelContent += `<td>${val}</td>`;
    });
    excelContent += "</tr>";
  });

  excelContent += "</table>";

  const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "KnowledgeBase.xls";
  a.click();
};


  return (
    <MainLayout>
      <div className="kb-page">

        {/* Header */}
        <div className="page-header">
          <h1>Knowledge Base</h1>
          <button
            onClick={() => navigate("/kb/new")}
            className="btn-primary"
          >
            + Add Article
          </button>
        </div>

        {/* Filters */}
        <div className="kb-filters">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Networking">Networking</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Security">Security</option>
            <option value="Cloud">Cloud</option>
            <option value="ITSM">ITSM</option>
          </select>

          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="kb-actions">
          <button className="btn-danger" onClick={editSelected}>Edit</button>
          <button className="btn-danger" onClick={deleteSelected}>Delete</button>
          <button className="btn-danger" onClick={exportExcel}>Export Excel</button>
        </div>

        {/* Table */}
        <table className="kb-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Title</th>
              <th>Summary</th>
              <th>Category</th>
              <th>Author</th>
              <th>Tags</th>
              <th>Helpful</th>
              <th>Attachments</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((a) => (
              <tr key={a._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(a._id)}
                    onChange={() => toggleSelect(a._id)}
                  />
                </td>
                <td>{a.title}</td>
                <td>{a.summary}</td>
                <td>{a.category}</td>
                <td>{a.author}</td>
                <td>{a.tags?.join(", ")}</td>
                <td>👍 {a.helpfulVotes}</td>
                <td>
                  {a.attachments?.map((att) => (
                    <div key={att._id}>
                      <a href={att.url} target="_blank" rel="noreferrer">
                        {att.name}
                      </a>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
