import { Navigate } from "react-router-dom";
import { hasPermission } from "../utils/rbac";

export default function RoleRoute({ permission, children }) {
  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
