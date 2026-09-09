import React, { useEffect, useState } from "react";
import { getDepreciationLedger } from "../../api/assetApi";

export default function DepreciationLedger() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDepreciationLedger()
      .then((res) => {
        if (!mounted) return;
        setRows(res.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.response?.data?.error || err.message || "Failed to load");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Depreciation Ledger</h1>
      </div>

      {loading && <div>Loading depreciation ledger…</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Serial</th>
                <th>Manufacturer</th>
                <th>Model</th>
                <th>Purchase Date</th>
                <th>Purchase Cost</th>
                <th>Residual Value</th>
                <th>Age (months)</th>
                <th>Current Book Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan="9">No records found</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.assetId}>
                  <td>{r.assetTag}</td>
                  <td>{r.serialNumber}</td>
                  <td>{r.product?.manufacturer || "-"}</td>
                  <td>{r.product?.modelName || "-"}</td>
                  <td>{r.financial?.purchaseDate ? new Date(r.financial.purchaseDate).toLocaleDateString() : "-"}</td>
                  <td>{r.financial?.purchaseCost != null ? r.financial.purchaseCost.toLocaleString() : "-"}</td>
                  <td>{r.financial?.residualValue != null ? r.financial.residualValue.toLocaleString() : "-"}</td>
                  <td>{r.ageMonths ?? "-"}</td>
                  <td>{r.dynamicBookValue != null ? r.dynamicBookValue.toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
