export default function CIRelationships({ data }) {
  return (
    <div className="relationship-panel">

      <h3>Dependencies</h3>
      {data.dependencies.map(d => <p key={d._id}>{d.name}</p>)}

      <h3>Dependents</h3>
      {data.dependents.map(d => <p key={d._id}>{d.name}</p>)}

      <h3>Linked Assets</h3>
      {data.assets.map(a => <p key={a._id}>{a.asset_tag}</p>)}

      <h3>Linked Changes</h3>
      {data.changes.map(c => <p key={c._id}>{c.title}</p>)}

    </div>
  );
}
