import { Bar } from "react-chartjs-2";

export default function TicketsByPriority({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <div className="chart-card">
      <h3>Tickets by Priority</h3>
      <Bar data={data} options={options} height={150} />
    </div>
  );
}
