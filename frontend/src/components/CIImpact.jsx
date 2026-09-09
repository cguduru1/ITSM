export default function CIImpact({ data }) {
  return (
    <div className="impact-panel">
      <h2>Impact Analysis</h2>

      <p><strong>Risk Level:</strong> {data.risk}</p>
      <p><strong>Impact Score:</strong> {data.impactScore}</p>

      <h3>Affected Dependencies</h3>
      {data.affected.dependencies.map(d => <p key={d._id}>{d.name}</p>)}

      <h3>Affected Dependents</h3>
      {data.affected.dependents.map(d => <p key={d._id}>{d.name}</p>)}

      <h3>Affected Assets</h3>
      {data.affected.assets.map(a => <p key={a._id}>{a.asset_tag}</p>)}

      <h3>Affected Changes</h3>
      {data.affected.changes.map(c => <p key={c._id}>{c.title}</p>)}
    </div>
  );
}
