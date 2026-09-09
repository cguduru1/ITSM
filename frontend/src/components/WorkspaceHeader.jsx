export default function WorkspaceHeader({ title, onAdd }) {
  return (
    <div className="workspace-header">

      {/* LEFT */}
      <div>
        <h1>{title}</h1>
        <p className="workspace-subtitle">Unified workspace for all module operations</p>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="workspace-actions">
        <input
          type="text"
          placeholder="Search..."
          className="workspace-search"
        />

        <button className="btn-secondary">Filters</button>
        <button className="btn-secondary">Export</button>

        <button className="btn-primary" onClick={onAdd}>
          + Add
        </button>
      </div>

    </div>
  );
}
