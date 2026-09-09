export function cabInviteTemplate(change, riskScore) {
  return `
CAB Review Required

Change: ${change.title}
Type: ${change.type}
Status: ${change.status}

Planned Start: ${change.plannedStart}
Planned End: ${change.plannedEnd}

Risk Score: ${riskScore}

Please review this change before the CAB meeting.

Approve: https://yourapp.com/changes/${change._id}/approve
Reject: https://yourapp.com/changes/${change._id}/reject
`;
}
