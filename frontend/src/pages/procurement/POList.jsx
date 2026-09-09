import React, { useEffect, useState } from "react";
import { getPOs, receivePO } from "../../api/assetApi";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { Link } from "react-router-dom";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";

export default function POList({ purchaseOrders, onSelect}) {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  // Helper to normalize apiClient response
  const parseList = (res) => (Array.isArray(res) ? res : res?.data || res?.pos || []);
  

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getPOs()
      .then((res) => {
        if (mounted) setPos(parseList(res));
      })
      .catch((err) => {
        if (mounted) setError(err?.message || "Failed to load POs");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleEdit = (po) => {
  // Extract the proper ID variable from your database fields
  const idToEdit = po._id || po.id;
  
  if (idToEdit) {
    // Target the route matching your App router configuration
    nav(`/procurement/edit/${idToEdit}`); 
  } else {
    console.error("Could not find a valid ID for this Purchase Order:", po);
    alert("Error: Purchase Order identifier missing.");
  }
};

const handleDelete = async (e, poId) => {
  // 1. Prevent the click from bubbling up to parent row handlers
  e.stopPropagation();

  if (!window.confirm("Are you sure you want to delete this Purchase Order?")) {
    return;
  }

  try {
    // 2. Call your delete API endpoint (e.g., deletePO or revokeAllocation)
    await apiClient.del(`/api/purchase-orders/${poId}`);
    
    // 3. Refresh list or update local state
    setPos((prev) => prev.filter((item) => item._id !== poId && item.poNumber !== poId));
  } catch (err) {
    const errorMessage = 
      err?.response?.data?.error || 
      err?.response?.data?.message || 
      err?.message || 
      "Failed to delete Purchase Order";
    alert(`Error: ${errorMessage}`);
  }
};

  const handleReceive = async (poNumber) => {
    if (!poNumber) {
      alert("Invalid PO Number");
      return;
    }
    if (!window.confirm(`Mark PO ${poNumber} as received and create assets?`)) return;

    try {
      await receivePO(poNumber);
      const res = await getPOs();
      setPos(parseList(res));
      alert(`PO ${poNumber} received and assets created`);
    } catch (err) {
      alert(err?.message || "Receive failed");
    }
  };

  return (
  <div className="quantum-page">
    {/* Header */}
    <div className="ticket-header"> 
    <div className="quantum-header">
      <h1>📦 Purchase Orders</h1> 
      <div>
        <button
          className="quantum-btn quantum-btn-primary"
          onClick={() => nav("/procurement/new")}
        >
          + New PO
        </button>
      </div>
    </div>
    </div>

    {/* Loading / Error states */}
    {loading && (
      <div className="quantum-card quantum-info">Loading purchase orders…</div>
    )}
    {error && (
      <div className="quantum-card quantum-error">Error: {error}</div>
    )}

    {/* Table */}
    {!loading && !error && (
      <div className="quantum-card quantum-table-container">
         <table
    className="quantum-table"
    style={{
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #334155"
    }}
  >
          <thead>
            <tr style={{ borderBottom: "2px solid #334155", background: "#1e293b", color: "#f8fafc" }}>
        <th style={{ border: "1px solid #334155", padding: "8px" }}>PO Number</th>
        <th style={{ border: "1px solid #334155", padding: "8px" }}>Vendor</th>
        <th style={{ border: "1px solid #334155", padding: "8px" }}>Requested By</th>
        <th style={{ border: "1px solid #334155", padding: "8px" }}>Items</th>
        <th style={{ border: "1px solid #334155", padding: "8px" }}>Status</th>
        <th style={{ border: "1px solid #334155", padding: "8px" }}>Received At</th>
        <th style={{ border: "1px solid #334155", padding: "8px" }}>Actions</th>
      </tr>
          </thead>
          <tbody>
            {pos.length === 0 && (
              <tr style={{ background: "#0f172a" }}>
          <td
            colSpan="7"
            className="muted"
            style={{ textAlign: "center", border: "1px solid #334155", padding: "8px" }}
          >
                  No purchase orders
                </td>
              </tr>
            )}
                {pos.map((po, idx) => {
            const poId = po._id || po.id || idx;
            const poNum = po.poNumber || po._id;

              return (
                 <tr
            key={poId}
            onClick={() => nav(`/procurement/edit/${po._id}`)}
            style={{
              borderBottom: "1px solid #334155",
              background: idx % 2 === 0 ? "#1e293b" : "#0f172a",
              color: "#e2e8f0"
            }}
          >
            <td style={{ border: "1px solid #334155", padding: "8px" }}>{po.poNumber || "N/A"}</td>
            <td style={{ border: "1px solid #334155", padding: "8px" }}>
              {po.vendorId?.name || po.vendorId || "-"}
            </td>
            <td style={{ border: "1px solid #334155", padding: "8px" }}>
              {po.requestedBy?.name || po.requestedBy || "-"}
            </td>
                  <td style={{ border: "1px solid #334155", padding: "8px" }}>
              {po.items?.length > 0
                ? po.items.map((it, i) => (
                    <div key={i}>
                      {it.quantity} × {it.modelId?.name || it.modelId || "Item"} @ ${it.unitCost}
                    </div>
                  ))
                : "-"}
            </td>
                   <td style={{ border: "1px solid #334155", padding: "8px" }}>{po.status || "Pending"}</td>
            <td style={{ border: "1px solid #334155", padding: "8px" }}>
              {po.receivedAt ? new Date(po.receivedAt).toLocaleString() : "-"}
            </td>
            <td style={{ border: "1px solid #334155", padding: "8px" }}>
              <div className="quantum-flex" style={{ gap: "8px" }}>
                <button
                  className="quantum-btn quantum-btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation(); // 🔴 Stops the row's onClick from firing
                    nav(`/procurement/${po._id || encodeURIComponent(po.poNumber)}`, {
                      state: { mode: "view" }
                    });
                  }}
                >
                        🔍 View
                      </button>
                      <button
                  className="quantum-btn quantum-btn-warning"
                  onClick={() => handleEdit(po)}
                >
                        ✏ Edit
                      </button>
                      <button
                  className="quantum-btn quantum-btn-danger"
                  onClick={(e) => handleDelete(e, po._id || po.poNumber)}
                >
                        🗑 Delete
                      </button>
                      {po.status !== "Received" && (
                        <button
                    className="quantum-btn quantum-btn-success"
                    onClick={() => handleReceive(poNum)}
                  >
                          ✅ Receive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
}