import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);


import CIRiskMatrixSN from "../components/CIRiskMatrixSN";
import CISLABreachPredictorSN from "../components/CISLABreachPredictorSN";
import CIAutoDiscoverySN from "../components/CIAutoDiscoverySN";
import CIInteractiveRelTreeSN from "../components/CIInteractiveRelTreeSN";
import CIHistoryDiscovery from "../components/CIHistoryDiscovery";
import CITypeIconSN from "../components/CITypeIconSN";
import "../styles/CMDB.css";

import WorkspaceHeader from "../components/WorkspaceHeader";
import "../styles/workspace.css";




export default function CMDB() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);


  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const res = await api.get("/api/cmdb", {
        params: { search, page, pageSize }
      });

       // If backend returns array directly
      if (Array.isArray(res.data)) {
        setItems(res.data);
        setTotalPages(1);
      }

      // If backend returns paginated structure
      if (res.data.table) {
        const sorted = res.data.table.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setItems(sorted);
        setTotalPages(res.data.totalPages);
      }

    } catch (err) {
      console.error("LOAD ERROR:", err);
    }

    setLoading(false);
  };

  const loadHistory = async () => {
  const res = await api.get("/api/cmdb/discovery/history");
  setHistory(res.data);
};

  useEffect(() => {
    loadData();
  }, [search, page]);

  const exportExcel = () => {
    if (items.length === 0) return;
    const rows = items.map((ci) => ({
      Name: ci.name,
      Status: ci.operational_status,
      Environment: ci.environment,
      // Category: ci.category,
      AssetTag: ci.asset_tag,
      SerialNumber: ci.serial_number,
      ManagedBy: ci.managed_by,
      LastAttested: ci.last_attested,
      MaintenanceMethod: ci.maintenance_method
    }));

    let excelContent = "<table><tr>";

    Object.keys(rows[0]).forEach((key) => {
      excelContent += `<th>${key}</th>`;
    });

    excelContent += "</tr>";

    rows.forEach((row) => {
      excelContent += "<tr>";
      Object.values(row).forEach((val) => {
        excelContent += `<td>${val || ""}</td>`;
      });
      excelContent += "</tr>";
    });

    excelContent += "</table>";

    const blob = new Blob([excelContent], {
      type: "application/vnd.ms-excel"
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cmdb.xls";
    a.click();
  };

  return (
    <MainLayout>
       <div className="page-container cmdb-page">

          {/* PAGE HEADER */}
          <div className="page-header">
            <h1>CMDB Configuration Items</h1>
          </div>

          {/* ADD CI BUTTON */}
          <div className="cmdb-top-actions">
            <button className="btn-primary" onClick={() => navigate("/cmdb/new")}>
              + Add CI
            </button>
          </div>

          {/* NEW MENU */}
        {/* SN-style tabs */}
<div className="sn-menu-line">
  <span className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>
    <i className="ri-stack-line"></i> Dashboard
  </span>

  <span className={tab === "lists" ? "active" : ""} onClick={() => setTab("lists")}>
    <i className="ri-stack-line"></i> Lists
  </span>

  <span className={tab === "charts" ? "active" : ""} onClick={() => setTab("charts")}>
    <i className="ri-stack-line"></i> Charts
  </span>

  <span className={tab === "heatmap" ? "active" : ""} onClick={() => setTab("heatmap")}>
    <i className="ri-stack-line"></i> Heatmap
  </span>

  <span className={tab === "risk" ? "active" : ""} onClick={() => setTab("risk")}>
    <i className="ri-stack-line"></i> Risk Matrix
  </span>

  <span className={tab === "sla" ? "active" : ""} onClick={() => setTab("sla")}>
    <i className="ri-stack-line"></i> SLA Predictor
  </span>

  <span className={tab === "discovery" ? "active" : ""} onClick={() => setTab("discovery")}>
    <i className="ri-stack-line"></i> Discovery
  </span>

  <span className={tab === "relationsTree" ? "active" : ""} onClick={() => setTab("relationsTree")}>
    <i className="ri-stack-line"></i> Relationship Tree
  </span>

  <span className={tab === "historydiscovery" ? "active" : ""} onClick={() => setTab("historydiscovery")}>
  <i className="ri-history-line"></i> Discovery History
</span>

</div>

{/* DASHBOARD TAB */}
{tab === "dashboard" && (
<div className="sn-grid">

  <div className="sn-card sn-widget">
    <h3>Total CIs</h3>
    <p className="sn-number">{items.length}</p>
  </div>

  <div className="sn-card sn-widget">
    <h3>Production</h3>
    <p className="sn-number">{items.filter(i => i.environment === "Production").length}</p>
  </div>

  <div className="sn-card sn-widget">
    <h3>Active</h3>
    <p className="sn-number">{items.filter(i => i.operational_status === "Active").length}</p>
  </div>

  <div className="sn-card sn-widget danger">
    <h3>Down</h3>
    <p className="sn-number">{items.filter(i => i.operational_status === "Down").length}</p>
  </div>

</div>
)
}


{/* LISTS TAB */}
{tab === "lists" && (
  <>
    {/* SEARCH + EXPORT */}
    <div className="cmdb-actions-row">
      <input
        type="text"
        placeholder="Search by name..."
        className="cmdb-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button className="btn-secondary" onClick={exportExcel}>
        Export Excel
      </button>
    </div>

    {/* EDIT + DELETE BUTTONS */}
    <div className="cmdb-edit-actions">
      <button className="btn-danger">Edit</button>
      <button className="btn-danger">Delete</button>
    </div>

<div className="sn-table-wrapper">

     {/* TABLE */}
     <div className="sn-table-scroll">

    <table className="sn-table">
      <thead>
        <tr>
          <th><input type="checkbox" /></th>
          <th>Name</th>
          <th>Status</th>
          <th>Environment</th>
          {/* <th>Category</th> */}
          <th>Asset Tag</th>
          <th>Serial Number</th>
          <th>Managed By</th>
          <th>Last Attested</th>
          <th>Maintenance Method</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {items.length === 0 && (
          <tr>
            <td colSpan="10">No CI records found</td>
          </tr>
        )}

        {items.map((ci) => (
          <tr key={ci._id}>
            <td><input type="checkbox" /></td>
            <td>{ci.name}</td>
            <td>{ci.operational_status}</td>
            <td>{ci.environment}</td>
            {/* <td>{ci.category}</td> */}
            <td>{ci.asset_tag}</td>
            <td>{ci.serial_number}</td>
            <td>{ci.managed_by}</td>
            <td>
              {ci.last_attested
                ? new Date(ci.last_attested).toLocaleString()
                : "N/A"}
            </td>
            <td>{ci.maintenance_method}</td>

            <td>
              <button onClick={() => navigate(`/cmdb/view/${ci._id}`)}>
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>

   {/* PAGINATION */}
    <div className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        Previous
      </button>

      <span>Page {page} of {totalPages}</span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
    </div>
  </>
)}

{/* CHARTS TAB */}
{tab === "charts" && (
  <div className="cmdb-charts">
    <h2 style={{ marginBottom: "20px" }}>CMDB Charts</h2>

    {/* Parent wrapper for side-by-side layout */}
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      
      {/* Status Distribution Card */}
      <div 
        style={{ 
          flex: 1, 
          minWidth: "300px",
          height: "350px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}
      >
      <h3 style={{ color: "#4c4c8d", marginTop: 0 }}>Status Distribution</h3>
      <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
        <ul>
          <li>Active: {items.filter(ci => ci.operational_status === "Active").length}</li>
          <li>Maintenance: {items.filter(ci => ci.operational_status === "Maintenance").length}</li>
          <li>Retired: {items.filter(ci => ci.operational_status === "Retired").length}</li>
          <li>Down: {items.filter(ci => ci.operational_status === "Down").length}</li>
        </ul>
      </div>
      </div>

      {/* Environment Distribution Card */}
      <div 
        style={{ 
          flex: 1, 
          minWidth: "300px",
          height: "350px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <h3 style={{ color: "#4c4c8d", marginTop: 0 }}>Environment Distribution</h3>
        <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
        <ul>
          <li>Production: {items.filter(ci => ci.environment === "Production").length}</li>
          <li>Staging: {items.filter(ci => ci.environment === "Staging").length}</li>
          <li>QA: {items.filter(ci => ci.environment === "QA").length}</li>
          <li>Development: {items.filter(ci => ci.environment === "Development").length}</li>
        </ul>
      </div>
      </div>

      {/* Pie chart */}
      <div 
        style={{ 
          flex: 1, 
          minWidth: "300px",
          height: "350px", /* Constrains card height */
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}
      >
  <h3 style={{ color: "#4c4c8d", marginTop: 0 }}>Status Distribution</h3>

  <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>

  <Pie
    data={{
      labels: ["Active", "Maintenance", "Retired", "Down"],
      datasets: [
        {
          data: [
            items.filter(ci => ci.operational_status === "Active").length,
            items.filter(ci => ci.operational_status === "Maintenance").length,
            items.filter(ci => ci.operational_status === "Retired").length,
            items.filter(ci => ci.operational_status === "Down").length
          ],
          backgroundColor: ["#2a9d8f", "#ffb703", "#6c757d", "#e63946"]
        }
      ]
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false
    }}
    height={200}
  />
</div>
</div>

<div 
        style={{ 
          flex: 1, 
          minWidth: "300px",
          height: "350px", /* Constrains card height */
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}
      >
  <h3 style={{ color: "#4c4c8d", marginTop: 0 }}>Environment Distribution</h3>
  <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>

  <Bar
    data={{
      labels: ["Production", "Staging", "QA", "Development"],
      datasets: [
        {
          label: "Count",
          data: [
            items.filter(ci => ci.environment === "Production").length,
            items.filter(ci => ci.environment === "Staging").length,
            items.filter(ci => ci.environment === "QA").length,
            items.filter(ci => ci.environment === "Development").length
          ],
          backgroundColor: "#2563eb"
        }
      ]
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }}
    height={200}
  />
</div>
</div>
\

    </div>
  </div>
)}

{/* HEATMAP TAB */}
{tab === "heatmap" && (
  <div className="cmdb-heatmap">
    <h2>CMDB Heatmap</h2>

    <div className="heatmap-grid">
      {items.map(ci => (
        <div
          key={ci._id}
          className="heatmap-cell"
          style={{
            background:
              ci.operational_status === "Down"
                ? "#e63946"
                : ci.operational_status === "Maintenance"
                ? "#ffb703"
                : "#2a9d8f"
          }}
        >
          {ci.name}
        </div>
      ))}
    </div>
  </div>
        )}

{tab === "risk" && <CIRiskMatrixSN />}
{tab === "sla" && <CISLABreachPredictorSN />}
{tab === "discovery" && <CIAutoDiscoverySN />}
{tab === "relationstree" && selectedCI && (
  <CIInteractiveRelTreeSN ciId={selectedCI._id} />
)}
{tab === "historydiscovery" && <CIHistoryDiscovery />}

        </div>
    </MainLayout>
  );
}
