import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ForceGraph2D } from "react-force-graph";
import apiClient from "../api/apiClient"; // Adjust depth ('../' vs '../../') based on exact folder structure
import "../../styles/cmdb.css";

export default function CMDBRelations() {
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Replaced 'api' with 'apiClient'
        const res = await apiClient.get("/api/cmdb/service-map");
        
        // Extract items safely across different wrapper styles
        const cis = res?.data?.all || res?.all || res?.data || (Array.isArray(res) ? res : []);

        if (!Array.isArray(cis)) {
          setGraph({ nodes: [], links: [] });
          return;
        }

        const nodes = cis.map(ci => ({
          id: String(ci._id || ci.id),
          name: ci.name || "Unnamed CI",
          type: ci.type || "Unknown"
        }));

        const links = [];
        cis.forEach(ci => {
          const relationships = ci.relationships || [];
          relationships.forEach(rel => {
            const targetId = rel.target?._id || rel.targetCi?._id || rel.target || rel.targetCi;
            if (targetId) {
              links.push({
                source: String(ci._id || ci.id),
                target: String(targetId),
                type: rel.type || "depends_on"
              });
            }
          });
        });

        setGraph({ nodes, links });
      } catch (err) {
        console.error("REL ERROR:", err);
        setError("Failed to load topology graph.");
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading topology graph...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  return (
    <
    <div style={{ width: "100%", height: "600px", background: "#111" }}>
      <ForceGraph2D
        graphData={graph}
        nodeLabel="name"
        nodeAutoColorBy="type"
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
      />
    </div>
  );
}