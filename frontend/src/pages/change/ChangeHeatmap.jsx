import { useEffect, useState } from "react";
import HeatMap from "react-heatmap-grid";
// import api from "../../api/api";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";

export default function ChangeHeatmap() {
  const [matrix, setMatrix] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  const [yLabels, setYLabels] = useState([]);

  useEffect(() => {
    api.get("/analytics/change-heatmap").then((res) => {
      const { xLabels, yLabels, matrix } = res.data;
      setXLabels(xLabels);
      setYLabels(yLabels);
      setMatrix(matrix);
    });
  }, []);

  return (
    <div className="change-heatmap-container">
      <h2 className="heatmap-title">Change Management Heatmap</h2>
      <p className="heatmap-subtitle">
        Visualizing change risk clusters, environment impact, and change density
      </p>

      <div className="heatmap-wrapper">
        <HeatMap
          xLabels={xLabels}
          yLabels={yLabels}
          data={matrix}
          squares
          height={40}
          width={60}
          xLabelsLocation={"bottom"}
          yLabelWidth={120}
          cellStyle={(background, value, min, max) => ({
            background: `rgba(239, 68, 68, ${value / max})`,
            color: value > max * 0.6 ? "#fff" : "#000",
            borderRadius: "4px",
            margin: "2px"
          })}
          cellRender={(value) => value && <span>{value}</span>}
        />
      </div>
    </div>
  );
}
