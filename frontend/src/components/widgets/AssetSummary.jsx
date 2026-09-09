export default function AssetSummary({ data }) {
  return (
    <div className="widget">
      <h3>Asset Summary</h3>
      <p>Total Assets: {data.total}</p>
      <p>Active: {data.active}</p>
      <p>Retired: {data.retired}</p>
    </div>
  );
}
