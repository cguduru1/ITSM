import { Bar } from "react-chartjs-2";

export default function AgentPerformance({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <div className="chart-card">
      <h3>Agent Performance</h3>
      <Bar data={data} options={options} height={150} />
    </div>
  );
}
