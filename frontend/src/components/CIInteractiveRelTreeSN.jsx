import { useEffect, useState } from "react";
import api from "../api/api";

export default function CIInteractiveRelTreeSN() {
  const [relations, setRelations] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [tree, setTree] = useState([]);

  useEffect(() => {
    if (!ciId) return;

    const loadTree = async () => {
      const res = await api.get(`/api/cmdb-rel/${ciId}`);
      setTree(res.data);
    };

    loadTree();
  }, [ciId]);

  const toggle = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="sn-rel-tree">
      <h2>CI Relationship Graph</h2>

      {relations.map(rel => (
         <div>
      <h3>Relationship Tree</h3>
      {tree.length === 0 && <p>No relationships found.</p>}
      {/* render tree here */}
        <div key={rel._id} className="sn-rel-node">
          <div className="sn-rel-node-header" onClick={() => toggle(rel._id)}>
            <span>{expanded[rel._id] ? "▼" : "▶"}</span>
            <strong>{rel.name}</strong>
          </div>

          {expanded[rel._id] && (
            <div className="sn-rel-node-body">
              {rel.relations.map(child => (
                <div key={child._id} className="sn-rel-child">
                  <span className="sn-rel-arrow">↳</span> {child.target}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      ))}
    </div>
  );
}
