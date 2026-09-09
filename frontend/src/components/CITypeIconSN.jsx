export default function CITypeIconSN({ type }) {
  const map = {
    Server: "🖥️",
    Database: "🗄️",
    Network: "🌐",
    Application: "📦",
    Storage: "💾",
    Security: "🔐"
  };

  return (
    <span className="sn-ci-icon">
      {map[type] || "📁"}
    </span>
  );
}
