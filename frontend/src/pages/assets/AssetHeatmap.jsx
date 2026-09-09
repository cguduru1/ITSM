import { useEffect, useState } from "react";
import HeatMap from "react-heatmap-grid";
// import api from "../../api/api";
import apiClient from "../../api/apiClient";
import "./assetHeatmap.css";

export default function AssetHeatmap() {
  const [matrix, setMatrix] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  const [yLabels, setYLabels] = useState([]);

  useEffect(() => {
    api.get("/analytics/asset-heatmap").then((res) => {
      const { xLabels, yLabels, matrix } = res.data;
      setXLabels(xLabels);
      setYLabels(yLabels);
      setMatrix(matrix);
    });
  }, []);

  return (
    <div className="asset-heatmap-container">
      <h2 className="heatmap-title">Asset Heatmap</h2>
      <p className="heatmap-subtitle">
        Visualizing asset health, environment distribution, and aging clusters
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
            background: `rgba(16, 185, 129, ${value / max})`,
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
