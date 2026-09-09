import React, { useState } from "react";
import { useQuery } from "react-query";
import { getAssets, getAsset, type Asset } from "../api/assetApi";
import LinkedTable from "../components/LinkedTable";
import ContextRail from "../components/ContextRail";

export default function AssetsList() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  // 1. Fetch main paginated assets
  const { data, isLoading } = useQuery(["assets", page], () =>
    getAssets({ _page: page, _limit: 25 })
  );

  // 2. Fetch single asset detail with react-query
  const { data: detail, isLoading: isLoadingDetail } = useQuery(
    ["asset", selected],
    () => getAsset(selected!),
    { enabled: Boolean(selected) }
  );

  // Normalize list response array
  const assetList: Asset[] = Array.isArray(data) ? data : data?.items || [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2>Assets</h2>
        <div>
          <button onClick={() => { /* open import modal */ }}>Import CSV</button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading assets…</div>
      ) : (
        <LinkedTable
          columns={[
            { key: "assetTag", label: "Asset Tag" },
            { key: "category", label: "Category" },
            { key: "modelName", label: "Model" },
            { key: "status", label: "Status" },
            { key: "owner", label: "Owner" }
          ]}
          rows={assetList.map((a: any) => ({
            ...a,
            category: a.category || "General",
            owner: a.owner?.name || "Unassigned"
          }))}
          onRowClick={(r: any) => setSelected(r._id || r.id)}
        />
      )}

      <div style={{ marginTop: 12 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </button>
        <span style={{ margin: "0 8px" }}>Page {page}</span>
        <button disabled={assetList.length < 25} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>

      <ContextRail open={Boolean(selected)} onClose={() => setSelected(null)}>
        {isLoadingDetail ? (
          <div>Loading details…</div>
        ) : detail ? (
          <div>
            <h3>
              {detail.assetTag} — {detail.modelName || "No Model"}
            </h3>
            <div>Category: {detail.category || "General"}</div>
            <div>Status: {detail.status || "Unknown"}</div>
            <div>Owner: {detail.owner?.name || "Unassigned"}</div>
            <div>
              Location: {detail.location?.site || "N/A"} / {detail.location?.building || "N/A"}
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => alert("Open edit modal")}>Edit</button>
              <button style={{ marginLeft: 8 }} onClick={() => alert("Create work order")}>
                Create Work Order
              </button>
            </div>
          </div>
        ) : (
          <div>No asset details found.</div>
        )}
      </ContextRail>
    </div>
  );
}