import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function CMDBDependencyTreeSN() {
  const [relations, setRelations] = useState([]);

  useEffect(() => {
    api.get("/api/cmdb-rel").then(res => {
      setRelations(res.data);
    });
  }, []);

  return (
    <div className="sn-dep-tree">
      <h2>CI Dependency Tree</h2>

      {relations.map(rel => (
        <div key={rel._id} className="sn-dep-node">
          <div className="sn-dep-parent">{rel.name}</div>

          <div className="sn-dep-children">
            {rel.relations.map(child => (
              <div key={child._id} className="sn-dep-child">
                <span className="sn-dep-arrow">↳</span> {child.target}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
