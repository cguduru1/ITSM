// src/components/cmdb/CMDBServiceMap.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

export default function CMDBServiceMap() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceMap = async () => {
      try {
        setLoading(true);
        // ✅ Fixed variable reference: used apiClient instead of api
        const res = await apiClient.get("/api/cmdb/service-map");
        
        // Safe destructuring with fallback empty arrays
        const data = res?.data || res || {};
        const services = Array.isArray(data.services) ? data.services : [];
        const all = Array.isArray(data.all) ? data.all : [];

        // Build Service Nodes
        const serviceNodes = services.map((s, idx) => ({
          id: String(s._id || s.id),
          data: { label: s.name || "Unnamed Service" },
          position: { x: idx * 200, y: 0 },
          style: { background: "#4ECDC4", color: "#0f172a", fontWeight: "bold" }
        }));

        // Build Infrastructure Nodes
        const infraNodes = all
          .filter((c) => c?.type !== "Service")
          .map((c, idx) => ({
            id: String(c._id || c.id),
            data: { label: c.name || "CI Node" },
            position: { x: (idx % 5) * 200, y: 200 + Math.floor(idx / 5) * 80 }
          }));

        // Build Edges
        const relEdges = [];
        all.forEach((ci) => {
          const sourceId = ci._id || ci.id;
          if (sourceId && Array.isArray(ci.relationships)) {
            ci.relationships.forEach((r, idx) => {
              if (r?.targetCi) {
                relEdges.push({
                  id: `e-${sourceId}-${r.targetCi}-${idx}`,
                  source: String(sourceId),
                  target: String(r.targetCi),
                  animated: true
                });
              }
            });
          }
        });

        setNodes([...serviceNodes, ...infraNodes]);
        setEdges(relEdges);
      } catch (err) {
        console.error("Failed to fetch CMDB service map:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceMap();
  }, []);

  return (
    <div className="cmdb-panel quantum" style={{ height: 500, width: "100%", position: "relative" }}>
      <h2 style={{ marginBottom: "12px" }}>📊 Service Map</h2>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
          <p>Loading topology map...</p>
        </div>
      ) : (
        <ReactFlow nodes={nodes} edges={edges} fitView />
      )}
    </div>
  );
}
