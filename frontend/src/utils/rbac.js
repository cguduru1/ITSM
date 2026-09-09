export function hasPermission(action) {
  const role = localStorage.getItem("role");

  const permissions = {
    admin: [
      "ticket:create",
      "ticket:update",
      "ticket:delete",
      "ticket:view_all",
      "settings:update",
      "sla:override",
      "dashboard:executive",
      "user:manage",
      "kb:manage",
      "asset:manage",
      "asset:view",
      "change:create",
      "change:view",
      "change:approve",
      "cmdb:manage",
      "cmdb:view"
    ],
    agent: [
      "ticket:create",
      "ticket:update",
      "ticket:view_assigned",
      "ticket:view_department",
      "dashboard:workload",
      "kb:view",
      "asset:view",
      "change:view",
      "cmdb:view"
    ],
    user: [
      "ticket:create",
      "ticket:view_own",
      "kb:view"
    ]
  };

  return permissions[role]?.includes(action);
}
