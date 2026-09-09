export default function CMDBSummary({ data }) {
  return (
    <div className="widget">
      <h3>CMDB Summary</h3>
      <p>Total CIs: {data.total}</p>
      <p>Infrastructure: {data.infra}</p>
      <p>Applications: {data.apps}</p>
    </div>
  );
}
