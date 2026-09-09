import React, { useEffect, useState } from "react";
import { getPO, receivePO } from "../../api/assetApi";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css"; 

export default function POReceive() {
  const { poNumber } = useParams();
  const nav = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null); // Reset errors on parameter change

    // FIX: Using the correct singular imported function and passing the poNumber directly
    getPO(poNumber)
      .then((res) => {
        if (!mounted) return;
        // Adjust depending on your API structure (assuming res.data returns the PO object)
        setPo(res.data || null);
      })
      .catch((err) => { 
        if (mounted) {
          setError(err?.response?.data?.error || err?.message || "Failed to load purchase order");
        } 
      })
      .finally(() => { 
        if (mounted) setLoading(false); 
      });

    return () => { mounted = false; };
  }, [poNumber]);

  const handleReceive = async () => {
    if (!po) return;
    
    const totalAssets = po.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    if (!window.confirm(`Receive PO ${po.poNumber} and create ${totalAssets} assets?`)) return;
    
    setProcessing(true);
    try {
      const res = await receivePO(po.poNumber);
      alert(`PO received successfully. Created assets: ${res.data.createdAssets?.length || 0}`);
      nav("/procurement");
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Receive failed");
    } finally {
      setProcessing(false);
    }
  };

  // UI state fallbacks
  if (loading) return <div className="quantum-loading">Loading PO…</div>;
  
  // FIX: Displaying the actual error if the API request fails
  if (error) return <div className="quantum-error-container">⚠️ Error: {error}</div>;
  if (!po) return <div className="quantum-error-container">PO not found</div>;if (loading) return <div>Loading PO…</div>;
  if (!po) return <div>PO not found</div>;

  return (
    <div className="quantum-page po-receive-page">
    {/* Header */}
    <div className="ticket-header"> 
      <h1 className="quantum-title">📥 Receive PO {po.poNumber}</h1>
      <Link to="/procurement" className="quantum-link" style={{ color: '#ffffff' }}>
        ← Back to Dashboard 
      </Link>
    </div>

      {/* Summary Section */}
    <section className="quantum-card quantum-summary mb-6">
      <h3 className="quantum-heading">Summary</h3>
      <dl className="quantum-dl">
        <dt className="quantum-label">Vendor</dt>
        <dd className="quantum-text-strong">{po.vendorId || "-"}</dd>

        <dt className="quantum-label">Requested By</dt>
        <dd className="quantum-text-strong">{po.requestedBy || "-"}</dd>

        <dt className="quantum-label">Status</dt>
        <dd>
          <span className={`quantum-badge quantum-badge-${(po.status || "Pending").toLowerCase()}`}>
            {po.status}
          </span>
        </dd>

        <dt className="quantum-label">Items</dt>
        <dd>
          {po.items?.length > 0 ? (
            <div className="quantum-item-list">
              {po.items.map((it, i) => (
                <div
                  key={i}
                  className="quantum-item-row"
                  style={{
                    background: i % 2 === 0 ? "#1e293b" : "#0f172a",
                    color: "#e2e8f0",
                    padding: "8px",
                    borderRadius: "4px"
                  }}
                >
                  {it.quantity} × {it.modelId} — unit cost ${Number(it.unitCost || 0).toFixed(2)}
                </div>
              ))}
            </div>
          ) : (
            "-"
          )}
        </dd>
      </dl>
    </section>

      {/* Actions */}
    <div className="quantum-form-actions">
      <button
        className="quantum-btn quantum-btn-primary"
        onClick={handleReceive}
        disabled={processing || po.status === "Received"}
      >
        {processing ? "Processing…" : "Mark as Received and Create Assets"}
      </button>
      <button
        className="quantum-btn quantum-btn-secondary"
        onClick={() => nav("/procurement")}
      >
        Cancel
      </button>
    </div>
  </div>
);
}
