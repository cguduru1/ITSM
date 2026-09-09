// utils/cmdbSanitize.js
export function sanitizeCiForUser(ci, user) {
  const isPrivileged = user.permissions.cmdb?.includes("sensitive");

  if (isPrivileged) return ci;

  const clone = { ...ci };
  delete clone.ipAddress;
  delete clone.credentialsRef;
  delete clone.backupLocation;
  return clone;
}
