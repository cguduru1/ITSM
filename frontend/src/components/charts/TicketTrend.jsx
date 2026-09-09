import { Line } from "react-chartjs-2";

export default function TicketTrend({ data }) {
  const isMobile = window.innerWidth < 768;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="chart-card wide">
      <h3>Ticket Trends (Last 30 Days)</h3>
      <Line data={data} options={options} height={isMobile ? 160 : 120} />
    </div>
  );
}
