import React, { useEffect, useState } from "react";
import { getAsset } from "../../api/assetApi";
import { useParams, useNavigate } from "react-router-dom";

export default function AssetDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    getAsset(id).then(r => setData(r.data)).catch(console.error);
  }, [id]);

  if (!data) return <div>Loading…</div>;

  const { asset, finance } = data;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{asset.assetName || asset.assetTag}</h1>
        <div>
          <button onClick={() => nav(`/assets/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <section>
        <h3>Asset</h3>
        <dl>
          <dt>Asset Tag</dt><dd>{asset.assetTag}</dd>
          <dt>Serial</dt><dd>{asset.serialNumber}</dd>
          <dt>Status</dt><dd>{asset.status}</dd>
          <dt>Assigned User</dt><dd>{asset.assignedUserId}</dd>
        </dl>
      </section>

      <section>
        <h3>Financial</h3>
        {finance ? (
          <dl>
            <dt>Purchase Date</dt><dd>{new Date(finance.purchaseDate).toLocaleDateString()}</dd>
            <dt>Cost</dt><dd>{finance.purchaseCost}</dd>
            <dt>Warranty Expiry</dt><dd>{finance.warrantyExpiryDate ? new Date(finance.warrantyExpiryDate).toLocaleDateString() : "—"}</dd>
            <dt>Book Value</dt><dd>{finance.currentBookValue}</dd>
          </dl>
        ) : <div>No financial record</div>}
      </section>
    </div>
  );
}
