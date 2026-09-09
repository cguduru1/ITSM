// components/cmdb/DimensionsNode.jsx
import React from "react";
import { Handle, Position } from "reactflow";  // or 'reactflow' depending on your v11/v12 version

export default function DimensionsNode({ data }) {
  return (
    <div className="quantum-node dimensions-node" style={{ padding: 10, background: "#1e1e24", border: "1px solid #00f0ff", borderRadius: 4, color: "#fff" }}>
      <Handle type="target" position={Position.Top} />
      <div>
        <strong>{data.label || "Dimension Asset"}</strong>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
