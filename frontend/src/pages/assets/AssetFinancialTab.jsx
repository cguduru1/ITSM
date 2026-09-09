import React from "react";

export default function AssetFinancialTab({ financial, asset }) {
  if (!financial) return <div>No financial data available.</div>;

  return (
    <section>
      <h3>Financial</h3>
      <div className="card">
        <dl>
          <dt>Purchase Date</dt><dd>{financial.purchaseDate ? new Date(financial.purchaseDate).toLocaleDateString() : "-"}</dd>
          <dt>Purchase Cost</dt><dd>{financial.purchaseCost != null ? financial.purchaseCost.toLocaleString() : "-"}</dd>
          <dt>Residual Value</dt><dd>{financial.residualValue != null ? financial.residualValue.toLocaleString() : "-"}</dd>
          <dt>Depreciation Method</dt><dd>{financial.depreciationMethod || "-"}</dd>
          <dt>Current Book Value</dt><dd>{financial.currentBookValue != null ? financial.currentBookValue.toLocaleString() : "-"}</dd>
        </dl>
      </div>

      <div className="card mt-3">
        <h4>Depreciation schedule</h4>
        {financial.depreciationSchedule?.length ? (
          <table className="table">
            <thead><tr><th>Period</th><th>Depreciation</th><th>Book Value</th></tr></thead>
            <tbody>
              {financial.depreciationSchedule.map((row, i) => (
                <tr key={i}><td>{row.period}</td><td>{row.depreciation.toLocaleString()}</td><td>{row.bookValue.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <div>No schedule available</div>}
      </div>
    </section>
  );
}
