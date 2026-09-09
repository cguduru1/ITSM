export function autoAssign(category, department) {
  const map = {
    Infrastructure: "Ravi",
    Messaging: "Anita",
    "Access Management": "Kiran",
    General: "Support Team"
  };

  if (department && department.toLowerCase() === "infra") return "Infra Team";
  if (department && department.toLowerCase() === "hr") return "HR Desk";

  return map[category] || "Support Team";
}
