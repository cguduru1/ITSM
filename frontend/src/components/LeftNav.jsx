// LeftNav.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoImg from "../assets/s3-logo.png";
import { useAuth } from "../hooks/useAuth";
// import usePermissions from "../hooks/usePermissions";  

const navItems = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/ticketdashboard", label: "Tickets", icon: "⚡" },
  { to: "/assets", label: "Assets", icon: "💎", perm: { resource: "asset", action: "read" } },
  { to: "/procurement", label: "Procurement", icon: "⭐" },
  { to: "/workspace/change", label: "Changes", icon: "🔧", perm: { resource: "change_request", action: "read" } },
  { to: "/cmdb-dashboard", label: "CMDB", icon: "🧬", perm: { resource: "asset", action: "read" } },
  { to: "/kb", label: "Knowledgebase", icon: "📡", perm: { resource: "kb", action: "read" } }
];

// export default function LeftNav({ isAdmin }) {
//   // Safe destructuring with fallback object guards against null values
//   const { user } = useAuth() || {};
//   const permissions = user?.permissions || {};

//   // Role & permission evaluation logic
//   const can = (resource, action) => {
//     if (!resource || !action) return true;

//     // Admins bypass standard permission checks
//     if (user?.role === "admin" || user?.role === "System Admin") return true;

//     // If permissions array/object isn't defined yet, default to allowing read access
//     if (!user?.permissions) return true;
    
//     return Boolean(permissions?.[resource]?.includes(action));
//   };
export default function LeftNav({ isAdmin }) {
  const { user } = useAuth() || {};
  const permissions = user?.permissions || {};
  const location = useLocation();

  const can = (resource, action) => {
    if (!resource || !action) return true;
    if (user?.role === "admin" || user?.role === "System Admin") return true;
    if (!user?.permissions) return true;
    return Boolean(permissions?.[resource]?.includes(action));
  };

//   return (
//     <nav className="left-nav" aria-label="Main modules">

//       {/* User Info */}
//       <div className="user-info" style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
//         <strong>{user?.name || user?.email || "User"}</strong>
//         <div style={{ fontSize: "12px", opacity: 0.8, textTransform: "capitalize" }}>
//           {user?.role || "Role"}
//         </div>
//       </div>

//       {/* Logo */}
//       <div className="nav-header" style={{ padding: "20px 16px 10px 16px" }}>
//         <img
//           src={logoImg}
//           alt="S3 Technologies"
//           style={{ width: "120px", height: "auto", display: "block" }}
//         />
//       </div>

//       <ul>
//         {/* MAIN NAV ITEMS */}
//         {navItems.map((item) => {
//           if (item.perm && !can(item.perm.resource, item.perm.action)) {
//             return null; // hide tile if permission missing
//           }

//           return (
//             <li key={item.to}>
//               <NavLink
//                 to={item.to}
//                 className={({ isActive }) =>
//                   isActive ? "nav-item active" : "nav-item"
//                 }
//               >
//                 <span className="nav-icon">{item.icon}</span>
//                 <span className="nav-label">{item.label}</span>
//               </NavLink>
//             </li>
//           );
//         })}

//         {/* Knowledge Ops (KB Admin or System Admin) */}
//         {(permissions?.kb?.includes("admin") || user?.role === "admin") && (
//           <li>
//             <NavLink to="/kb-ops" className="nav-item">
//               <span className="nav-icon">🔮</span>
//               <span className="nav-label">Knowledge Ops</span>
//             </NavLink>
//           </li>
//         )}

//         {/* Admin Section */}
//         {(isAdmin || user?.role === "admin") && (
//           <li>
//             <NavLink to="/admin" className="nav-item">
//               <span className="nav-icon">⚙️</span>
//               <span className="nav-label">Admin</span>
//             </NavLink>
//           </li>
//         )}
//       </ul>
//     </nav>
//   );
// }

return (
    <nav className="left-nav" aria-label="Main modules">
      {/* User Info */}
      <div className="user-info" style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <strong>{user?.name || user?.email || "User"}</strong>
        <div style={{ fontSize: "12px", opacity: 0.8, textTransform: "capitalize" }}>
          {user?.role || "Role"}
        </div>
      </div>

      {/* Logo */}
      <div className="nav-header" style={{ padding: "20px 16px 10px 16px" }}>
        <img
          src={logoImg}
          alt="S3 Technologies"
          style={{ width: "120px", height: "auto", display: "block" }}
        />
      </div>

      <ul>
        {/* MAIN NAV ITEMS */}
        {navItems.map((item) => {
          if (item.perm && !can(item.perm.resource, item.perm.action)) {
            return null;
          }

          // Keep Knowledgebase active even when on /kb-category/*
          const isKbActive = item.to === "/kb" && (
            location.pathname.startsWith("/kb") || location.pathname.startsWith("/kb-category")
          );

          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  (isActive || isKbActive) ? "nav-item active" : "nav-item"
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          );
        })}

        {/* Knowledge Ops */}
        {(permissions?.kb?.includes("admin") || user?.role === "admin") && (
          <li>
            <NavLink to="/kb-ops" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <span className="nav-icon">🔮</span>
              <span className="nav-label">Knowledge Ops</span>
            </NavLink>
          </li>
        )}

        {/* Admin Section */}
        {(isAdmin || user?.role === "admin") && (
          <li>
            <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Admin</span>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}