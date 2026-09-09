export default function ChangeSummary({ data }) {
  return (
    <div className="widget">
      <h3>Change Summary</h3>
      <p>Total Changes: {data.total}</p>
      <p>Approved: {data.approved}</p>
      <p>Rejected: {data.rejected}</p>
    </div>
  );
}
