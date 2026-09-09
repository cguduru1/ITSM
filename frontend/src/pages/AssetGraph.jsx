import { useEffect, useState } from "react";
import api from "../api/api";
import { useParams } from "react-router-dom";

export default function AssetGraph() {
  const { id } = useParams();
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    api.get(`/assets/${id}/graph`).then((res) => setGraph(res.data));
  }, [id]);

  if (!graph) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Asset Relationship Graph</h1>

      <h3>Asset</h3>
      <p>{graph.asset.name}</p>

      <h3>Related CIs</h3>
      {graph.cis.map((ci) => <p key={ci._id}>{ci.name}</p>)}

      <h3>Related Changes</h3>
      {graph.changes.map((c) => <p key={c._id}>{c.title}</p>)}
    </div>
  );
}
