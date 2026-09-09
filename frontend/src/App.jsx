  // App.jsx
  import React from "react";
  import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// AUTH CONTEXT PROVIDER
  import { useAuth } from "./auth/AuthContext";
  import ProtectedRoute from "./routes/ProtectedRoute";
  import RoleRoute from "./routes/RoleRoute";

  import MainLayout from "./layouts/MainLayout";
  import AppLayout from "./AppLayout";

  // AUTH PAGES
  import Login from "./pages/Login";
  import ForgotPassword from "./pages/ForgotPassword";
  import ResetPassword from "./pages/ResetPassword";
  import ResetSuccess from "./pages/ResetSuccess";

  // DASHBOARD
  import DashboardHome from "./pages/DashboardHome";
  import LeftNav from "./components/LeftNav.jsx";
  import TopBar from "./components/TopBar.jsx";

  // WORKSPACE
  import CMDBWorkspace from "./workspace/CMDBWorkspace";
  import AssetWorkspace from "./pages/assets/AssetWorkspace.jsx";
  import ChangeWorkspace from "./workspace/ChangeWorkspace.jsx";

  // // TICKETS
  import TicketDashboard from "./pages/TicketDashboard";
  import TicketList from "./pages/TicketList";
  import TicketDetail from "./pages/TicketDetail";
  import TicketForm from "./pages/TicketForm";

  // // ASSETS
  import AssetsPage from "./pages/AssetsPage.jsx";
  import AssetForm from "./pages/AssetForm.tsx";
  import AssetDetail from "./pages/AssetDetails";
  import AssetEdit from "./pages/AssetEdit";
  import AssetDashboard from "./pages/assets/AssetDashboard";

  // PROCUREMENT
  import POList from "./pages/procurement/POList";
  import POCreate from "./pages/procurement/POCreate";
  import POReceive from "./pages/procurement/POReceive";
  import PODetail from "./pages/Procurement/PODetail";

  // CHANGES
  import Changes from "./pages/Changes.jsx";
  import CreateChangeRequest from "./pages/ChangeForm.jsx"; 

  import ChangeTimeline from "./pages/ChangeTimeline.jsx";
  import ChangeAnalyticsDashboard from "./pages/ChangeAnalyticsDashboard.jsx";
  import ChangeDashboard from "./pages/change/ChangeDashboard.jsx";
  import ChangeCharts from "./pages/change/ChangeCharts.jsx";
  import ChangeCalendar from "./pages/ChangeCalendar.jsx";
  import ChangeHeatmap from "./pages/change/ChangeHeatmap.jsx";

import ChangeWorkspaceQuantum from "./pages/ChangeWorkspaceQuantum.jsx";
import ChangeModuleHome from "./pages/ChangeModuleHome.jsx";
import ChangeList from "./pages/change/ChangeRequests.jsx";
import NormalChange from "./pages/change/NormalChange.jsx";
import StandardChange from "./pages/change/StandardChange.jsx";
import EmergencyChange from "./pages/change/EmergencyChange.jsx";
import DevOpsModels from "./pages/change/DevOpsModels.jsx";
import CSDMMapping from "./pages/change/CSDMMapping.jsx";
import RiskEngine from "./pages/change/RiskEngine.jsx";
import ConflictDetection from "./pages/change/ConflictDetection.jsx";
import DecisionTables from "./pages/change/DecisionTables.jsx";
import ServiceOps from "./pages/change/ServiceOps.jsx";
import CABWorkbench from "./pages/change/CABWorkbench.jsx";
import SuccessScore from "./pages/change/SuccessScore.jsx";
import ChangeAdmin from "./pages/change/ChangeAdmin.jsx";
import "./styles/changeQuantum.css";    // Your overrides (must come last)


  // CMDB
  // import CMDB from "./pages/CMDB";
  // import AddCI from "./pages/AddCI";
  // import EditCI from "./pages/EditCI";
  // import CIView from "./pages/CIView";
  import CMDBDashboard from "./pages/CMDBDashboard";
  import CMDBDetail from "./pages/CMDBDetail";
  import CMDBRelations from "./components/CMDBRelations";
  import CMDBExplorer from "./pages/CMDBExplorer.jsx";
  import CMDBAdd from "./pages/CMDBAdd.jsx";
  import CMDBEdit from "./pages/CMDBEdit.jsx";
  import CMDBPermissionAdmin from "./pages/CMDBPermissionAdmin.jsx";
  import CMDBChatbot from "./pages/CMDBChatbot.jsx";
  import CMDBIntegration from "./pages/CMDBIntegration.jsx";
  import CMDBHeatmap from "./pages/cmdb/CMDBHeatmap.jsx";
  import CMDBImpact from "./pages/cmdb/CMDBImpact.jsx";
  import AssetLifecycle from "./pages/AssetLifecycle.jsx";
  import CMDBCharts from "./pages/cmdb/CMDBCharts.jsx";

  // KB
  import KnowledgeBaseList from "./pages/KnowledgeBaseList.jsx";
  import KnowledgeBaseForm from "./pages/KnowledgeBaseForm.jsx";
  import KnowledgeBaseDetail from "./pages/KnowledgeBaseDetail.jsx";
  import KnowledgePortal from "./pages/KnowledgePortal.jsx";
  import KnowledgeCategoryDashboard from "./components/KnowledgeCategoryDashboard"; // confirm this file
  import KnowledgeOpsDashboard from "./pages/KnowledgeOpsDashboard.jsx";
  import KBAnalyticsPanel from "./components/kb/KBAnalyticsPanel";
  import KBCategoryHealth from "./components/kb/KBCategoryHealth";
  import KBAIInsights from "./components/kb/KBAIInsights";
  import KBWorkflowQueue from "./components/kb/KBWorkflowQueue";
  import KBVersionPanel from "./components/kb/KBVersionPanel";
  import KBAttachmentManager from "./components/kb/KBAttachmentManager";
  import KBExpiryMonitor from "./components/kb/KBExpiryMonitor";
  import KBMyContributions from "./components/kb/KBMyContributions";

  // CHATBOT
  import Chatbot from "./pages/Chatbot";

  // NOTIFICATIONS
  import Notifications from "./pages/Notifications";

  // Helper component to safely parse user permissions inside routes
function KBOpsRoute() {
  const { user } = useAuth();
  const isKbAdmin = user?.permissions?.kb?.includes("admin") || user?.role === "admin";

  return isKbAdmin
    ? <KnowledgeOpsDashboard />
    : <Navigate to="/kb-portal" replace />;
}

export default function App() {
  const location = useLocation();
  const isAuthPage = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/reset-success"
  ].some((path) => location.pathname.startsWith(path));

  const mockAdminUser = {
  role: "admin",
  permissions: { ticket: ["create", "read", "update", "delete", "analytics"] }
};

    return (
      <div className={isAuthPage ? "auth-page" : ""}>
        
        {/* Background */}
        <div className="hyperdrive-bg">
          <div className="hyperdrive-stars"></div>
          <div className="hyperdrive-plasma"></div>
        </div>

        {/* ROUTES */}
        <Routes>

          {/* AUTH — NO SIDEBAR */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-success" element={<ResetSuccess />} />

          {/* Redirect root to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* PROTECTED ROUTES — ALL USE MAINLAYOUT */}
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardHome /></MainLayout></ProtectedRoute>}/>

          {/* WORKSPACE */}
          <Route path="/workspace/cmdb" element={<ProtectedRoute><MainLayout><CMDBDashboard /></MainLayout></ProtectedRoute>}/>
          <Route path="/workspace/assets" element={<ProtectedRoute><MainLayout><AssetWorkspace /></MainLayout></ProtectedRoute>}/>
          <Route path="/workspace/changes" element={<ProtectedRoute><MainLayout><ChangeWorkspace /></MainLayout></ProtectedRoute>}/>

          {/* TICKETS */}
          <Route path="/ticketdashboard" element={<ProtectedRoute><MainLayout><TicketDashboard
            user={{
              role: "admin",
              permissions: { ticket: ["create", "read", "update", "delete", "analytics", "assign"] }
            }}
          /></MainLayout></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><MainLayout><TicketList user={{
            role: "admin",
            permissions: { ticket: ["create", "read", "update", "delete", "analytics", "assign"] }
          }} /></MainLayout></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute><MainLayout><TicketForm mode="create" user={{
            role: "admin",
            permissions: { ticket: ["create", "read", "update", "delete", "analytics", "assign"] }
          }} /></MainLayout></ProtectedRoute>} />   
          <Route path="/tickets/:id/edit" element={<ProtectedRoute><MainLayout><TicketForm mode="edit" user={{
            role: "admin",
            permissions: { ticket: ["create", "read", "update", "delete", "analytics", "assign"] }
          }} /></MainLayout></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><MainLayout><TicketDetail user={{
            role: "admin",
            permissions: { ticket: ["create", "read", "update", "delete", "analytics", "assign"] }
          }}/></MainLayout></ProtectedRoute>} />

          {/* ASSET` */}
          <Route path="/assets" element={<ProtectedRoute><MainLayout><AssetsPage /></MainLayout></ProtectedRoute>}/>
          <Route path="/assets/new" element={<ProtectedRoute><MainLayout><AssetForm /></MainLayout></ProtectedRoute>}/>
          <Route path="/assets/edit/:id" element={<ProtectedRoute><MainLayout><AssetEdit /></MainLayout></ProtectedRoute>} />
          <Route path="/assets/:id" element={<ProtectedRoute><MainLayout><AssetDetail /></MainLayout></ProtectedRoute>}/>
          <Route path="/asset-lifecycle" element={<ProtectedRoute><MainLayout><AssetLifecycle /></MainLayout></ProtectedRoute>}/>
          <Route path="/asset-dashboard" element={<ProtectedRoute><MainLayout><AssetDashboard /></MainLayout></ProtectedRoute>}/>
                  
          {/* PROCUREMENT */}
          <Route path="/procurement" element={ <ProtectedRoute> <MainLayout> <POList /></MainLayout> </ProtectedRoute>}/>
          <Route path="/procurement/new" element={<ProtectedRoute><MainLayout><POCreate /></MainLayout></ProtectedRoute>}/>
          <Route path="/procurement/edit/:id" element={<ProtectedRoute><MainLayout><POCreate /></MainLayout></ProtectedRoute>}/> {/* 👈 Add Edit Route */}
          <Route path="/procurement/:poNumber/receive" element={<ProtectedRoute><MainLayout><POReceive /></MainLayout></ProtectedRoute>}/>
          <Route path="/procurement/:id" element={<ProtectedRoute><MainLayout><PODetail /></MainLayout></ProtectedRoute>} />
          
          {/* CHANGES */}
          <Route path="/workspace/change" element={<ProtectedRoute><MainLayout><ChangeWorkspaceQuantum /></MainLayout></ProtectedRoute>}/>
          <Route path ="/change-module" element={<ProtectedRoute><MainLayout><ChangeModuleHome /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/list" element={<ProtectedRoute><MainLayout><ChangeList /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/normal" element={<ProtectedRoute><MainLayout><NormalChange /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/standard" element={<ProtectedRoute><MainLayout><StandardChange /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/emergency" element={<ProtectedRoute><MainLayout><EmergencyChange /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/devops" element={<ProtectedRoute><MainLayout><DevOpsModels /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/csdm" element={<ProtectedRoute><MainLayout><CSDMMapping /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/risk" element={<ProtectedRoute><MainLayout><RiskEngine /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/conflicts" element={<ProtectedRoute><MainLayout><ConflictDetection /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/decisions" element={<ProtectedRoute><MainLayout><DecisionTables /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/ops" element={<ProtectedRoute><MainLayout><ServiceOps /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/cab" element={<ProtectedRoute><MainLayout><CABWorkbench /></MainLayout></ProtectedRoute>} />
          <Route path="/changes/success" element={<ProtectedRoute><MainLayout><SuccessScore /></MainLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><MainLayout><ChangeAdmin /></MainLayout></ProtectedRoute>} />

          {/* CMDB */}
          <Route path="/cmdb-dashboard" element={<ProtectedRoute><MainLayout><CMDBDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/cmdb-integration" element={<ProtectedRoute><MainLayout><CMDBIntegration /></MainLayout></ProtectedRoute>}/>
          <Route path="/cmdb" element={<ProtectedRoute><MainLayout><CMDBExplorer /></MainLayout></ProtectedRoute>}/>
          <Route path="/cmdb/new" element={<ProtectedRoute><MainLayout><CMDBAdd /></MainLayout></ProtectedRoute>} />
          <Route path="/cmdb/edit/:id" element={<ProtectedRoute><MainLayout><CMDBEdit /></MainLayout></ProtectedRoute>} />
          <Route path="/cmdb/ci/:id" element={<ProtectedRoute><MainLayout><CMDBDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/cmdb-permissions" element={<ProtectedRoute><MainLayout><CMDBPermissionAdmin /></MainLayout></ProtectedRoute>} />
          <Route path="/cmdb-chatbot" element={<ProtectedRoute><MainLayout><CMDBChatbot /></MainLayout></ProtectedRoute>} />
          <Route path="/cmdb-heatmap" element={<ProtectedRoute><MainLayout><CMDBHeatmap /></MainLayout></ProtectedRoute>} />
          <Route path="/cmdb-impact" element={<ProtectedRoute><MainLayout><CMDBImpact /></MainLayout></ProtectedRoute>} />
          <Route path="/cmdb-relationships" element={<ProtectedRoute><MainLayout><CMDBRelations /></MainLayout></ProtectedRoute>} />
          <Route path="/asset-lifecycle" element={<ProtectedRoute><MainLayout><AssetLifecycle /></MainLayout></ProtectedRoute>} />
          {/* <Route path="/cmdb-health" element={<ProtectedRoute><MainLayout><AssetLifecycle /></MainLayout></ProtectedRoute>} /> */}
          <Route path="/cmdb-charts" element={<ProtectedRoute><MainLayout><CMDBCharts /></MainLayout></ProtectedRoute>} />

         {/* KB Portal Core Routes */}
          <Route path="/kb" element={<ProtectedRoute><MainLayout><KnowledgePortal /></MainLayout></ProtectedRoute>} />
          <Route path="/kb-category/:category" element={<ProtectedRoute><MainLayout><KnowledgeCategoryDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/kb/new" element={<ProtectedRoute><MainLayout><KnowledgeBaseForm /></MainLayout></ProtectedRoute>} />
          <Route path="/kb/list" element={<ProtectedRoute><MainLayout><KnowledgeBaseList /></MainLayout></ProtectedRoute>} />
          <Route path="/kb/edit/:id" element={<ProtectedRoute><MainLayout><KnowledgeBaseForm /></MainLayout></ProtectedRoute>} />
          <Route path="/kb/:id" element={<ProtectedRoute><MainLayout><KnowledgeBaseDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/kb-ops" element={<ProtectedRoute><MainLayout><KnowledgeOpsDashboard /></MainLayout></ProtectedRoute>} />
          
          {/* KB Operations Direct Routes */}
          <Route path="/kb-ops/analytics" element={<ProtectedRoute><MainLayout><KBAnalyticsPanel /></MainLayout></ProtectedRoute>} />
          <Route path="/kb-ops/category-health" element={<ProtectedRoute><MainLayout><KBCategoryHealth /></MainLayout></ProtectedRoute>} />
          <Route path="/kb-ops/ai-insights" element={<ProtectedRoute><MainLayout><KBAIInsights /></MainLayout></ProtectedRoute>} />
          <Route path="/kb-ops/workflow" element={<ProtectedRoute><MainLayout><KBWorkflowQueue /></MainLayout></ProtectedRoute>} />
          <Route path="/kb-ops/versioning" element={<ProtectedRoute><MainLayout><KBVersionPanel /></MainLayout></ProtectedRoute>} />
          <Route path="/kb-ops/attachments" element={<ProtectedRoute><MainLayout><KBAttachmentManager /></MainLayout></ProtectedRoute>} />
          <Route path="/kb-ops/expiry" element={<ProtectedRoute><MainLayout><KBExpiryMonitor /></MainLayout></ProtectedRoute>} />
          <Route path="/kb-ops/my-contributions" element={<ProtectedRoute><MainLayout><KBMyContributions /></MainLayout></ProtectedRoute>} />
          
                    
          {/* CHAT */}
          <Route path="/chat" element={<ProtectedRoute><MainLayout><Chatbot /></MainLayout></ProtectedRoute>}/>

          {/* NOTIFICATIONS */}
          <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>}/>

          {/* UNAUTHORIZED */}
        <Route path="/unauthorized" element={<h2>403 - Unauthorized Access</h2>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    );
  }
