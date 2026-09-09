import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPO, getPOs, receivePO } from "../../api/assetApi";
import apiClient from "../../api/apiClient";
import { Link } from "react-router-dom";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css"; 

export default function PODetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiving, setReceiving] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Fetch single PO by ID or fallback to scanning PO list if no direct endpoint
    const fetchPODetails = async () => {
      try {
        let poData = null;
        if (typeof getPO === "function") {
          const res = await getPO(id);
          poData = res?.data || res?.po || res;
        } else {
          // Fallback if single GET endpoint is not implemented in assetApi
          const res = await getPOs();
          const list = Array.isArray(res) ? res : res?.data || res?.pos || [];
          poData = list.find((item) => String(item._id || item.id || item.poNumber) === String(id));
        }

        if (!poData) throw new Error("Purchase Order not found");
        if (mounted) setPo(poData);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || err?.message || "Failed to load PO details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPODetails();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleReceive = async () => {
    const poNum = po?.poNumber || po?._id;
    if (!poNum) return;

    if (!window.confirm(`Mark PO ${poNum} as received and auto-create asset records?`)) {
      return;
    }

    setReceiving(true);
    try {
      await receivePO(poNum);
      alert(`PO ${poNum} successfully received! Assets created.`);
      // Refresh local PO state to reflect updated status
      setPo((prev) => ({
        ...prev,
        status: "Received",
        receivedAt: new Date().toISOString()
      }));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Failed to process receipt");
    } finally {
      setReceiving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">Loading Purchase Order details…</div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="page">
        <div className="error-card">
          <h2>Error Loading PO</h2>
          <p>{error || "Purchase order not found"}</p>
          <button className="btn btn-secondary" onClick={() => nav("/procurement")}>
            ← Back to PO List
          </button>
        </div>
      </div>
    );
  }

  // Calculate Total PO Amount
  const totalCost = (po.items || []).reduce(
    (acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitCost || 0)),
    0
  );

  return (
    <div className="quantum-page po-detail-page">
    {/* Header */}
    <div className="ticket-header"> 
    <div className="quantum-header flex justify-between items-center mb-6">
      <div>
        <button
          className="quantum-btn quantum-btn-link"
          onClick={() => nav("/procurement")}
        >
          ← Back to Purchase Orders
        </button>
        <h1 className="quantum-title">PO #{po.poNumber || po._id}</h1>
        <Link to="/procurement" className="quantum-link" style={{ color: '#ffffff' }}>
                      ← Back to Dashboard
                  </Link>
      </div>
      </div>

      <div className="actions flex gap-2">
        {po.status !== "Received" && (
          <button
            className="quantum-btn quantum-btn-primary"
            onClick={handleReceive}
            disabled={receiving}
          >
            {receiving ? "Receiving…" : "Mark as Received"}
          </button>
        )}
        <button
          className="quantum-btn quantum-btn-secondary"
          onClick={() => nav("/procurement")}
        >
          Close
        </button>
      </div>
    </div>

      {/* Details Grid */}
    <div className="quantum-grid quantum-grid-3 gap-6 mb-6">
      <div className="quantum-card">
  <label className="quantum-label">Status</label>
  <div>
    <span className={`quantum-badge quantum-badge-${(po.status || "Pending").toLowerCase()}`}>
      {po.status || "Requested"}
    </span>
  </div>
</div>

      <div className="quantum-card">
        <label className="quantum-label">Vendor</label>
        <div className="quantum-text-strong">
          {po.vendorId?.name || po.vendorId || "N/A"}
        </div>
      </div>

      <div className="quantum-card">
        <label className="quantum-label">Requested By</label>
        <div className="quantum-text-strong">
          {po.requestedBy?.name || po.requestedBy || "N/A"}
        </div>
      </div>

        <div className="quantum-card">
        <label className="quantum-label">Receiving Location</label>
        <div>{po.receivingLocation || "N/A"}</div>
      </div>

      <div className="quantum-card">
        <label className="quantum-label">Invoice Number</label>
        <div>{po.invoiceNumber || "N/A"}</div>
      </div>

      <div className="quantum-card">
        <label className="quantum-label">Received Date</label>
        <div>
          {po.receivedAt
            ? new Date(po.receivedAt).toLocaleString()
            : "Not Yet Received"}
        </div>
      </div>
    </div>

      {/* Items Section */}
    <section className="items-section mb-6">
      <h3 className="quantum-heading">Purchased Items</h3>
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
            <tr style={{ background: "#0f172a" }}>
        <th style={{ color: "#FFD700", fontWeight: "700", border: "1px solid #334155", padding: "8px" }}>
          Model / Item
        </th>
        <th style={{ color: "#FFD700", fontWeight: "700", border: "1px solid #334155", padding: "8px" }}>
          Quantity
        </th>
        <th style={{ color: "#FFD700", fontWeight: "700", border: "1px solid #334155", padding: "8px" }}>
          Unit Cost
        </th>
        <th style={{ color: "#FFD700", fontWeight: "700", border: "1px solid #334155", padding: "8px" }}>
          Asset Name (Optional)
        </th>
        <th style={{ color: "#FFD700", fontWeight: "700", border: "1px solid #334155", padding: "8px" }}>
          Subtotal
        </th>
      </tr>
          </thead>
          <tbody>
               {(po.items || []).length === 0 ? (
              <tr>
                 <td colSpan="5" style={{ textAlign: "center", border: "1px solid #334155", padding: "8px" }}>
            No items found on this order.
          </td>
              </tr>
            ) : (
              po.items.map((item, idx) => {
                const modelDisplay =
                  item.modelId?.name ||
                  item.modelId?.modelName ||
                  item.modelId ||
                  "Standard Item";
                const itemSubtotal =
                  (item.quantity || 0) * (item.unitCost || 0);

                return (
                 <tr
              key={idx}
              style={{
                background: idx % 2 === 0 ? "#1e293b" : "#0f172a",
                color: "#e2e8f0"
              }}
            >
                      <td style={{ border: "1px solid #334155", padding: "8px" }}>{modelDisplay}</td>
              <td style={{ border: "1px solid #334155", padding: "8px" }}>{item.quantity}</td>
              <td style={{ border: "1px solid #334155", padding: "8px" }}>
                ${Number(item.unitCost || 0).toFixed(2)}
              </td>
              <td style={{ border: "1px solid #334155", padding: "8px" }}>
                {item.assetName || "-"}
              </td>
              <td style={{ border: "1px solid #334155", padding: "8px" }}>
                ${itemSubtotal.toFixed(2)}
              </td>
            </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "#0f172a", color: "#FFD700", fontWeight: "700" }}>
        <td colSpan="4" style={{ textAlign: "right", border: "1px solid #334155", padding: "8px" }}>
          Total Cost:
        </td>
        <td style={{ border: "1px solid #334155", padding: "8px" }}>
          ${totalCost.toFixed(2)}
        </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

      {/* <style>{`
        .po-detail-page { max-width: 1100px; margin: 0 auto; }
        .detail-card { background: #f9f9f9; padding: 12px 16px; border-radius: 6px; border: 1px solid #eee; }
        .text-muted { color: #666; font-size: 0.85rem; display: block; margin-bottom: 4px; }
        .btn-link { background: none; border: none; color: #0066cc; cursor: pointer; padding: 0; margin-bottom: 8px; text-decoration: underline; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; text-transform: capitalize; }
        .status-received { background: #e6f4ea; color: #137333; }
        .status-requested, .status-pending { background: #fef7e0; color: #b06000; }
        .status-cancelled { background: #fce8e6; color: #c5221f; }
        .error-card { padding: 2rem; border: 1px solid #fcc; background: #fff0f0; border-radius: 8px; text-align: center; }
        .table tfoot td { border-top: 2px solid #ccc; font-size: 1.05rem; }
      `}</style> */}
    </div>
  );
}