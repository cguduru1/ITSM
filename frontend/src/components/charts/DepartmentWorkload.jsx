import { Pie } from "react-chartjs-2";

export default function DepartmentWorkload({ data }) {
  const isMobile = window.innerWidth < 768;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" }
    }
  };

  return (
    <div className="chart-card">
      <h3>Department Workload</h3>
      <Pie data={data} options={options} height={isMobile ? 140 : 120} />
    </div>
  );
}
