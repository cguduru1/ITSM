import { useEffect, useState } from "react";
import api from "../api/api";
import MainLayout from "../layouts/MainLayout";

export default function ChangeHeatmap() {
  const [heatmap, setHeatmap] = useState([]);

  useEffect(() => {
    api.get("/change-heatmap/heatmap")
      .then(res => setHeatmap(res.data))
      .catch(err => console.error(err));
  }, []);

  const getColor = (count) => {
    if (count === 0) return "#b6fcb6";     // green
    if (count <= 3) return "#fff7a1";      // yellow
    return "#ffb3b3";                      // red
  };

  return (
    <MainLayout>
      <h1>Change Calendar Heatmap</h1>

      <div className="heatmap-grid">
        {heatmap.map(day => (
          <div
            key={day.date}
            className="heatmap-cell"
            style={{ background: getColor(day.count) }}
            onClick={() => alert(day.changes.map(c => c.title).join("\n"))}
          >
            <strong>{day.date}</strong>
            <p>{day.count} changes</p>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
