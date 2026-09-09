import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import ScheduleCAB from "../../pages/ScheduleCAB";
import CABTimeline from "../../pages/CABTimeline";
import CABAutomation from "../../pages/CABAutomation";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css"; 

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function CABWorkbench() {
  const chartRef = useRef(null);
  const legendRef = useRef(null);
  const [cabMeetings, setCabMeetings] = useState([]);

  const { upcoming, pendingSignOffs } = useMemo(() => {
    const upcoming = cabMeetings?.filter(m => m.status === "Upcoming") || [];
    const pendingSignOffs = upcoming.filter(m => !m.signedOff).length;
    return { upcoming, pendingSignOffs };
  }, [cabMeetings]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/meetings")
      .then(res => setCabMeetings(res.data));
  }, []);

  // Aggregate CAB meetings per month
  const monthlyData = useMemo(() => {
    const counts = {};
    cabMeetings?.forEach(m => {
      const month = new Date(m.date).toLocaleString("default", { month: "short", year: "numeric" });
      counts[month] = (counts[month] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const values = Object.values(counts);
    return { labels, values };
  }, [cabMeetings]);

   // Summary stats
  const summaryStats = useMemo(() => {
    const total = cabMeetings?.length || 0;
    const upcoming = cabMeetings?.filter(m => m.status === "Upcoming").length || 0;
    const completed = cabMeetings?.filter(m => m.status === "Completed").length || 0;
    return { total, upcoming, completed };
  }, [cabMeetings]);

  // Forecast + confidence band logic (same as before)
  const { forecast, upper, lower } = useMemo(() => {
    const values = monthlyData.values;
    if (!values || values.length < 2) return { forecast: [], upper: [], lower: [] };

    const n = values.length;
    const x = values.map((_, i) => i + 1);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const residuals = y.map((yi, i) => yi - (slope * x[i] + intercept));
    const mse = residuals.reduce((acc, r) => acc + r * r, 0) / (n - 2);
    const stdError = Math.sqrt(mse);

    const forecast = [];
    const upper = [];
    const lower = [];
    for (let i = n + 1; i <= n + 3; i++) {
      const pred = slope * i + intercept;
      forecast.push(Math.max(0, pred));
      upper.push(Math.max(0, pred + stdError));
      lower.push(Math.max(0, pred - stdError));
    }
    return { forecast, upper, lower };
  }, [monthlyData]);

  const chartData = {
    labels: [...monthlyData.labels, "Forecast +1", "Forecast +2", "Forecast +3"],
    datasets: [
      {
        label: "CAB Meetings per Month",
        data: [...monthlyData.values, null, null, null],
        borderColor: "#38bdf8",
        backgroundColor: "#0ea5e9",
        tension: 0.3,
      },
      {
        label: "Forecast",
        data: [...Array(monthlyData.values.length).fill(null), ...forecast],
        borderColor: "#f59e0b",
        borderDash: [5, 5],
        tension: 0.3,
      },
      {
        label: "Upper Bound",
        data: [...Array(monthlyData.values.length).fill(null), ...upper],
        borderColor: "rgba(245, 158, 11, 0.2)",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        fill: "-1",
        tension: 0.3,
      },
      {
        label: "Lower Bound",
        data: [...Array(monthlyData.values.length).fill(null), ...lower],
        borderColor: "rgba(245, 158, 11, 0.2)",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "Forecast") {
              return `Forecast: ${context.formattedValue} (±1 std error)`;
            }
            if (context.dataset.label === "Upper Bound" || context.dataset.label === "Lower Bound") {
              return `Confidence Band: ${context.formattedValue}`;
            }
            return `${context.dataset.label}: ${context.formattedValue}`;
          },
        },
      },
    },
  };

  const sortedMeetings = useMemo(() => {
    return [...(cabMeetings || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [cabMeetings]);

   // Add new meeting
  const handleSchedule = async (newMeeting) => {
    const res = await axios.post("http://localhost:4000/api/meetings", newMeeting);
    setCabMeetings(prev => [...prev, res.data]);
  };

  // Reschedule or update
  const handleReschedule = async (meetingId, newDate) => {
  const res = await axios.put(`http://localhost:4000/api/meetings/${meetingId}`, {
    date: newDate
  });

  setCabMeetings(prev =>
    prev.map(m => m._id === meetingId ? res.data : m)
  );
};


  // Delete meeting
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:4000/api/meetings/${id}`);
    setCabMeetings(prev => prev.filter(m => m._id !== id));
  };

  const handleDragEnd = async (result) => {
  if (!result.destination) return;

  const reordered = Array.from(cabMeetings);
  const [moved] = reordered.splice(result.source.index, 1);
  reordered.splice(result.destination.index, 0, moved);

  // Example: update the moved meeting’s date to reflect new order
  // (you can decide how to calculate the new date)
  moved.date = new Date().toISOString(); // placeholder logic

  // Persist to backend
  const res = await axios.put(`http://localhost:4000/api/meetings/${moved._id}`, moved);

  // Update local state
  setCabMeetings(reordered.map(m => m._id === res.data._id ? res.data : m));
};


  // Export chart as PNG
  const exportPNG = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement("a");
      link.href = url;
      link.download = "cab-workload-chart.png";
      link.click();
    }
  };

  // Export data as CSV
  const exportCSV = () => {
    const rows = [["Month", "CAB Meetings"]];
    monthlyData.labels.forEach((label, i) => {
      rows.push([label, monthlyData.values[i]]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "cab-workload-data.csv";
    link.click();
  };

    // Export chart + legend as PDF
  const exportPDF = async () => {
    const chartCanvas = chartRef.current?.canvas;
    const legendDiv = legendRef.current;

    const pdf = new jsPDF("p", "mm", "a4");

    // Cover Page
    pdf.setFontSize(18);
    pdf.text("CAB Workbench Report", 105, 30, { align: "center" });
    pdf.setFontSize(12);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 105, 40, { align: "center" });
    pdf.text(`Total CAB Meetings: ${summaryStats.total}`, 20, 60);
    pdf.text(`Upcoming: ${summaryStats.upcoming}`, 20, 70);
    pdf.text(`Completed: ${summaryStats.completed}`, 20, 80);

    pdf.addPage();

    // Chart Page
    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL("image/png", 1.0);
      pdf.addImage(chartImage, "PNG", 10, 10, 180, 90);
    }

    // Legend Page
    if (legendDiv) {
      pdf.addPage();
      const legendCanvas = await html2canvas(legendDiv);
      const legendImage = legendCanvas.toDataURL("image/png", 1.0);
      pdf.addImage(legendImage, "PNG", 10, 20, 180, 40);
    }

    pdf.save("cab-workload-report.pdf");
  };

  return (
    <div className="quantum-page">
      <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>🛠 CAB Workbench</h1>
        <p className="quantum-subtitle">
          Automate agendas, time‑boxed reviews and sign‑offs
        </p>
        <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
                  ← Back to Dashboard
        </Link>
      </header>
      </div>

      <div className="quantum-page-body quantum-grid">
        
        {/* Workload Trends Panel */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Workload Trends</h3>
          <div className="quantum-card">
            {chartData.labels.length > 0 ? (
              <>
                <Line ref={chartRef} data={chartData} options={chartOptions} />
                {/* Legend Explanation */}
                <div ref={legendRef} className="legend-explanation">
                  <p><span style={{color:"#38bdf8"}}>━</span> Historical CAB workload</p>
                  <p><span style={{color:"#f59e0b"}}>━ ┄</span> Forecast (linear regression)</p>
                  <p><span style={{backgroundColor:"rgba(245,158,11,0.2)", padding:"0 10px"}}></span> Confidence Band (±1 std error)</p>
                </div>
                {/* Export Buttons */}
                <div className="export-buttons">
                  <button onClick={exportPNG} className="quantum-button">Export Chart (PNG)</button>
                  <button onClick={exportCSV} className="quantum-button">Export Data (CSV)</button>
                  <button onClick={exportPDF} className="quantum-button">Export Report (PDF)</button>
                </div>
              </>
            ) : (
              <p>No CAB meetings data available.</p>
            )}
          </div>
        </section>
        
        {/* Scheduling Form */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Schedule a CAB</h3>
          <div className="quantum-card">
            <ScheduleCAB onSchedule={handleSchedule} />
          </div>
        </section>

        {/* Timeline Panel */}
        {/* <section className="quantum-panel">
      <h3 className="quantum-heading">CAB Timeline</h3>
      <div className="quantum-card cab-timeline">
        {sortedMeetings.length > 0 ? (
          <ul className="timeline-list">
            {sortedMeetings.map((m, idx) => (
              <li key={idx} className={`timeline-item ${m.status.toLowerCase()}`}>
                <div className="timeline-date">{m.date}</div>
                <div className="timeline-content">
                  <strong>{m.agenda}</strong>
                  <p>Status: {m.status}</p>
                  <p>Attendees: {m.attendees.join(", ")}</p>
                  <p>Signed Off: {m.signedOff ? "✅ Yes" : "❌ No"}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No CAB meetings scheduled.</p>
        )}
      </div>
    </section>   */}

     {/* Timeline with Drag‑and‑Drop */}
        <CABTimeline cabMeetings={cabMeetings} onReschedule={handleReschedule} />

        {/* Automation Panel */}
         {/* <section className="quantum-panel">
      <h3 className="quantum-heading">Automation</h3>
      <div className="quantum-card">
        <p>Agendas auto‑generated, reminders sent, and sign‑off tracking enabled.</p>
        <p>
          {pendingSignOffs > 0
            ? `${pendingSignOffs} upcoming CAB meetings awaiting sign‑off.`
            : "All upcoming CAB meetings are signed off."}
        </p>
        <p>
          {upcoming.length > 0
            ? `Next CAB scheduled on ${upcoming[0].date}.`
            : "No upcoming CAB meetings scheduled."}
        </p>
      </div>
    </section> */}
    {/* Automation Summary */}
        <CABAutomation cabMeetings={cabMeetings} />
      </div>
    </div>
  );
}
