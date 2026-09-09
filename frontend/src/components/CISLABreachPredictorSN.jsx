import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function CISLABreachPredictorSN() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get("/api/tickets").then(res => {
      setTickets(res.data || []);
    });
  }, []);

  const predicted = tickets.filter(t => t.slaBreached || t.predictedBreached);

  return (
    <div className="sn-sla-predictor">
      <h2>SLA Breach Predictor</h2>

      {predicted.length === 0 && <p>No predicted breaches</p>}

      {predicted.map(t => (
        <div key={t._id} className="sn-sla-item">
          <div className="sn-sla-header">
            <strong>{t.title}</strong>
            <span>{t.priority}</span>
          </div>
          <p><strong>Category:</strong> {t.category}</p>
          <p><strong>Assigned To:</strong> {t.assignedTo}</p>
          <p><strong>SLA Target:</strong> {t.slaTarget}</p>
        </div>
      ))}
    </div>
  );
}
