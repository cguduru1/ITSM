import React from "react";

export default function AssetHeader({ asset, financial, onEdit, onPrint, onCreatePO }) {
  return (
    <header className="asset-header">
      <div className="left">
        <h2>{asset.assetName || asset.modelId || asset.assetTag}</h2>
        <div className="meta">
          <span className={`status-badge status-${asset.status?.toLowerCase() || "unknown"}`}>{asset.status}</span>
          <span className="muted"> • {asset.assetTag}</span>
        </div>
      </div>

      <div className="right">
        <div className="stat">
          <div className="label">Book Value</div>
          <div className="value">{financial?.currentBookValue != null ? financial.currentBookValue.toLocaleString() : "-"}</div>
        </div>

        <div className="actions">
          <button className="btn" onClick={onCreatePO}>Create PO</button>
          <button className="btn" onClick={onEdit}>Edit</button>
          <button className="btn" onClick={onPrint}>Print Tag</button>
        </div>
      </div>

      <style jsx>{`
        .asset-header { display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .meta { color:#666; margin-top:6px; }
        .status-badge { padding:4px 8px; border-radius:12px; font-size:0.85rem; color:#fff; }
        .status-in-stock { background:#0b5fff; }
        .status-retired { background:#6b7280; }
        .actions button { margin-left:8px; }
        .stat { display:inline-block; margin-right:12px; text-align:right; }
        .label { font-size:0.75rem; color:#666; }
        .value { font-weight:600; }
      `}</style>
    </header>
  );
}
