// Simple SLA prediction based on priority + category
export function predictSLA(priority, category) {
  const p = (priority || "").toLowerCase();
  const c = (category || "").toLowerCase();

  // Base by priority
  let hours;
  if (p === "critical") hours = 4;
  else if (p === "high") hours = 8;
  else if (p === "medium") hours = 24;
  else hours = 48;

  // Adjust by category (example tuning)
  if (c.includes("infrastructure")) hours -= 2;      // infra is more urgent
  if (c.includes("messaging")) hours += 2;           // messaging slightly relaxed
  if (c.includes("access")) hours = Math.min(hours, 8); // access issues kept tight

  if (hours < 1) hours = 1;

  return `${hours} hours`;
}
