import React from "react";

export default function LinkedTable<T extends { _id?: string }>({
  columns,
  rows,
  onRowClick
}: {
  columns: { key: string; label: string }[];
  rows: T[];
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={(r as any)._id} onClick={() => onRowClick?.(r)} style={{ cursor: onRowClick ? "pointer" : "default" }}>
              {columns.map((c) => <td key={c.key}>{(r as any)[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
