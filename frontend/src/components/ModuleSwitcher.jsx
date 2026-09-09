import { NavLink } from "react-router-dom";
import "./moduleSwitcher.css";

export default function ModuleSwitcher() {
  return (
    <div className="module-switcher">
      <button className="switch-item active">Dashboard</button>
      <button className="switch-item">Lists</button>
      <button className="switch-item">Charts</button>
      <button className="switch-item">Heatmap</button>
    </div>
  );
}
