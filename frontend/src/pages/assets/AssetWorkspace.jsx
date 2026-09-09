import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssetWorkspace, allocateLicense, printAssetTag } from "../../api/assetApi";
import AssetHeader from "../../components/AssetHeader";
import AssetOverviewTab from "./AssetOverviewTab";
import AssetFinancialTab from "./AssetFinancialTab";
import AssetAllocationsTab from "./AssetAllocationsTab";
import AssetAuditTab from "./AssetAuditTab";

export default function AssetWorkspace() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAssetWorkspace(id)
      .then((res) => {
        if (!mounted) return;
        // Supports API returning either direct object or wrapped axios res.data
        setData(res.data || res);
      })
      .catch((err) => {
        if (!mounted) return; 
        setError(err?.response?.data?.error || err?.message || "Failed to load asset workspace");
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="page">Loading asset workspace…</div>;
  if (error) return <div className="page error">Error: {error}</div>;
  if (!data || !data.asset) return <div className="page">Asset not found</div>;

  const { asset, financial, allocations, audits, procurement } = data;

  // Normalize key identifier fallback
  const assetKey = asset._id || asset.id || asset.assetId;

  return (
    <div className="asset-workspace page">
      <AssetHeader
        asset={asset}
        financial={financial}
        onEdit={() => nav(`/assets/${assetKey}/edit`)}
        onPrint={() => printAssetTag(assetKey)}
        onCreatePO={() => nav("/procurement/new")}
      />

      <div className="workspace-grid">
        <aside className="workspace-left">
          <div className="card">
            <h4>Summary</h4>
            <dl>
              <dt>Asset Tag</dt><dd>{asset.assetTag}</dd>
              <dt>Serial</dt><dd>{asset.serialNumber || "-"}</dd>
              <dt>Model</dt><dd>{asset.modelId || asset.modelName || "-"}</dd>
              <dt>Location</dt><dd>{asset.locationId || "-"}</dd>
              <dt>Status</dt><dd>{asset.status}</dd>
              <dt>Purchase Date</dt>
              <dd>
                {financial?.purchaseDate? new Date(financial.purchaseDate).toLocaleDateString(): "-"}
              </dd>
              <dt>Book Value</dt>
              <dd>
                {financial?.currentBookValue != null? financial.currentBookValue.toLocaleString(): "-"}
              </dd>
              <dt>Age (months)</dt> <dd>{asset.ageMonths ?? "-"}</dd>
              <dt>Warranty</dt>
              <dd>
                {financial?.warrantyExpiryDate? `${Math.max(0, Math.ceil((new Date(financial.warrantyExpiryDate) - new Date()) /(1000 * 60 * 60 * 24)))} days`: "N/A"}
              </dd>
            </dl>
          </div>

          <div className="card">
            <h4>Quick Actions</h4>
            <div className="actions">
              <button className="btn" onClick={() => nav(`/procurement/${procurement?.poNumber || ""}`)} disabled={!procurement?.poNumber}> View PO </button>
              <button className="btn" onClick={() => nav(`/assets/${assetKey}/allocate`)}> Allocate License </button>
              <button className="btn" onClick={() => nav(`/assets/${assetKey}/print`)}> Print Tag </button>
              <button className="btn btn-danger" onClick={() => nav(`/assets/${assetKey}/retire`)}> Retire </button>
            </div>
          </div>
        </aside>

        <main className="workspace-main">
          <div className="tabs" role="tablist" aria-label="Asset workspace tabs">
            <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}> Overview </button>
            <button className={tab === "financial" ? "active" : ""} onClick={() => setTab("financial")}> Financial </button>
            <button className={tab === "allocations" ? "active" : ""} onClick={() => setTab("allocations")}> Allocations </button>
            <button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}> Audit </button>
          </div>

          <div className="tab-content">
            {tab === "overview" && (<AssetOverviewTab asset={asset} procurement={procurement} />)}
            {tab === "financial" && (<AssetFinancialTab financial={financial} asset={asset} />)}
            {tab === "allocations" && (<AssetAllocationsTab allocations={allocations} assetId={assetKey}/>)}
            {tab === "audit" && <AssetAuditTab assetId={assetKey} />}
          </div>
        </main>
      </div>

      <style>{`
        .workspace-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; margin-top: 16px; }
        .workspace-left .card { padding: 12px; margin-bottom: 12px; background: #fff; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
        .workspace-main .tabs { display:flex; gap:8px; margin-bottom:12px; }
        .tabs button { padding:8px 12px; border-radius:6px; border:1px solid #e6e6e6; background:#fafafa; cursor:pointer; }
        .tabs button.active { background:#0b5fff; color:#fff; border-color:#0b5fff; }
        @media (max-width: 900px) {
          .workspace-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
