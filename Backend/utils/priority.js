export function calculatePriority(impact, urgency) {
  const matrix = {
    "1 - High": { "1 - High": "1 - Critical", "2 - Medium": "2 - High", "3 - Low": "3 - Moderate" },
    "2 - Medium": { "1 - High": "2 - High", "2 - Medium": "3 - Moderate", "3 - Low": "4 - Low" },
    "3 - Low": { "1 - High": "3 - Moderate", "2 - Medium": "4 - Low", "3 - Low": "5 - Planning" },
  };

  return matrix[impact]?.[urgency] || "4 - Low";
}