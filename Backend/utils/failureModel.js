export const calculateFailureRisk = (asset) => {
  let score = 0;

  if (asset.ageYears > 3) score += 20;
  if (asset.healthScore < 50) score += 30;
  if (asset.incidentCount > 5) score += 25;
  if (asset.temperature > 70) score += 15;
  if (asset.cpuUsage > 90) score += 10;

  return Math.min(score, 100);
};
