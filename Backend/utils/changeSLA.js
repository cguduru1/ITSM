  export function getSLATarget(changeType) {
  if (changeType === "Emergency") return 4;
  if (changeType === "Normal") return 48;
  return 24; // Standard
}

export function calculateSLA(change) {
  const hours = getSLATarget(change.type);
  const start = new Date(change.createdAt);
  const deadline = new Date(start.getTime() + hours * 60 * 60 * 1000);

  const now = new Date();
  const remaining = deadline - now;

  return {
    slaHours: hours,
    deadline,
    remaining,
    breached: remaining < 0
  };
}
