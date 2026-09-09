import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import ModuleSwitcher from "../components/ModuleSwitcher";
import MainLayout from "../layouts/MainLayout";
import AppLayout from "../AppLayout";


export default function Assets() {
  const [assets, setAssets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/assets").then((res) => setAssets(res.data));
  }, []);

  return (
      <div className="page-container">

        {/* Add button should be on top */}
        <div className="top-actions">
          <button
            className="btn-primary"
            onClick={() => navigate("/assets/new")}
          >
            + Add Asset
          </button>
        </div>

        {/* Underline-style menu (same as CMDB) */}
        <div className="module-menu">
          <div className="menu-item active">Dashboard</div>
          <div className="menu-item" onClick={() => navigate("/assets/new")}>Lists</div>
          <div className="menu-item" onClick={() => navigate("/cmdb")}>Charts</div>
        </div>

        <div className="page">
          <h1>Assets</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Type</th><th>Status</th><th>Owner</th><th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((a) => (
            <tr key={a._id}>
              <td>{a.name}</td>
              <td>{a.type}</td>
              <td>{a.status}</td>
              <td>{a.owner}</td>
              <td>
                <button onClick={() => navigate(`/assets/${a._id}`)}>Edit</button>
                <button onClick={() => navigate(`/assets/details/${a._id}`)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    </div>
  );
}
