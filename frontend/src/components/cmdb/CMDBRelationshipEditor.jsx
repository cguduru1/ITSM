// src/components/cmdb/CMDBRelationshipEditor.jsx
import React, { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from "reactflow";
import "reactflow/dist/style.css";
import apiClient from "../../api/apiClient";
import DimensionsNode from "./DimensionsNode";

const nodeTypes = {
  dimensions: DimensionsNode, 
};

export default function CMDBRelationshipEditor({ ciId }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (!ciId) return;

    apiClient.get(`/api/cmdb/${ciId}`)
      .then((res) => {
        const responseData = res?.data ?? res;
        const root = responseData?.data || responseData?.ci || responseData || {};

        if (!root._id) return;

        // Base Node (The active CI)
        const baseNodes = [
          {
            id: root._id,
            data: { label: root.name || "Main CI" },
            position: { x: 250, y: 150 },
            style: { background: '#1e293b', color: '#fff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '10px' }
          }
        ];

        let extractedRels = [];

        // 1. Check explicitly defined relationships array
        if (Array.isArray(root.relationships) && root.relationships.length > 0) {
          extractedRels = root.relationships.map(r => ({
            id: r.targetCi?._id || r._id,
            name: r.targetCi?.name || r.name || "Related Item",
            type: r.type || "DEPENDS_ON"
          }));
        } 
        // 2. Fall back to dependencies, dependents, related_assets, related_changes
        else {
          const addRelItems = (arr, typeName) => {
            if (Array.isArray(arr)) {
              arr.forEach((item, idx) => {
                extractedRels.push({
                  id: item._id || item.id || `${typeName}-${idx}`,
                  name: item.name || item.title || `${typeName} #${idx + 1}`,
                  type: typeName
                });
              });
            }
          };

          addRelItems(root.dependencies, "DEPENDS_ON");
          addRelItems(root.dependents, "DEPENDENT");
          addRelItems(root.related_assets, "RELATED_ASSET");
          addRelItems(root.related_changes, "RELATED_CHANGE");
        }

        // Build React Flow nodes for related items
        const relNodes = extractedRels.map((r, idx) => ({
          id: String(r.id),
          data: { label: `${r.name}\n(${r.type})` },
          position: { x: 50 + (idx % 3) * 220, y: 300 + Math.floor(idx / 3) * 100 }
        }));

        // Build React Flow edges connecting active CI to related items
        const relEdges = extractedRels.map((r) => ({
          id: `e-${root._id}-${r.id}`,
          source: root._id,
          target: String(r.id),
          label: r.type,
          animated: true
        }));

        setNodes([...baseNodes, ...relNodes]);
        setEdges(relEdges);
      })
      .catch((err) => {
        console.error("Failed to load relationship graph:", err);
      });
  }, [ciId]);

  const onNodesChange = (changes) =>
    setNodes((ns) =>
      ns.map((n) => {
        const change = changes.find((c) => c.id === n.id);
        return change ? { ...n, ...change } : n;
      })
    );

  return (
  <div className="quantum-panel" style={{ height: 420 }}>
    <div className="quantum-header">Relationship Editor</div>

    {nodes.length <= 1 && (
      <p className="quantum-empty-state">
        No connected relationships, dependencies, or changes found for this item.
      </p>
    )}

    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      fitView
    >
      <Background color="var(--quantum-bg-secondary)" gap={16} />
      <Controls />
      <MiniMap nodeColor={() => "var(--quantum-accent)"} />
    </ReactFlow>
  </div>
);
}