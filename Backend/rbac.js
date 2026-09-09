// Role‑based access control (RBAC)

export const roles = {
  admin: {
    can: [
      "ticket:create",
      "ticket:update",
      "ticket:delete",
      "ticket:view_all",
      "user:manage",
      "settings:update",
      "sla:override",
      "dashboard:executive",

      // CMDB
      "cmdb:view",
      "cmdb:create",
      "cmdb:update",
      "cmdb:delete",
      "cmdb:relationships",
      "cmdb:analytics",
      "cmdb:impact",
      "cmdb:sensitive",
      "cmdb:approve",

      // Tickets
      "ticket:view",
      "ticket:create",
      "ticket:update",
      "ticket:delete",
      "ticket:analytics",
      "ticket:ai",

      // Knowledge
      "knowledge:view",
      "knowledge:create",
      "knowledge:update",
      "knowledge:delete",
      "knowledge:publish",
      "knowledge:analytics",
      "knowledge:ai"
    ]
  },

  cmdb_manager: {
    can: [
      "cmdb:view",
      "cmdb:create",
      "cmdb:update",
      "cmdb:relationships",
      "cmdb:impact",
      "cmdb:approve"
    ]
  },

  cmdb_editor: {
    can: [
      "cmdb:view",
      "cmdb:update",
      "cmdb:impact"
    ]
  },

  cmdb_viewer: {
    can: [
      "cmdb:view",
      "cmdb:impact"
    ]
  },

  service_desk_agent: {
    can: [
      "ticket:view",
      "ticket:create",
      "ticket:update",
      "ticket:ai"
    ]
  },

  service_desk_viewer: {
    can: [
      "ticket:view"
    ]
  },

  knowledge_author: {
    can: [
      "knowledge:view",
      "knowledge:create",
      "knowledge:update"
    ]
  },

  knowledge_reviewer: {
    can: [
      "knowledge:view",
      "knowledge:update",
      "knowledge:publish"
    ]
  },

  knowledge_viewer: {
    can: [
      "knowledge:view"
    ]
  }
};

export function can(role, action) {
  return roles[role]?.can.includes(action);
}
