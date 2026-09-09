export default function CIHealthWidgetSN({ score }) {
  const getColor = () => {
    if (score >= 80) return "#2a9d8f";
    if (score >= 50) return "#ffb703";
    return "#e63946";
  };

  return (
    <div className="sn-health-widget" style={{ borderLeftColor: getColor() }}>
      <h4>Health Score</h4>
      <p className="sn-health-number">{score}</p>
    </div>
  );
}
