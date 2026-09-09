import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetSuccess from "./pages/ResetSuccess";
import Chatbot from "./pages/Chatbot.jsx";
import CMDBChatbot from "./pages/CMDBChatbot.jsx"; 
import DashboardAdvanced from "./pages/DashboardAdvanced";
import LeftNav from "./components/LeftNav";
import TopBar from "./components/TopBar";
import DashboardHome from "./pages/DashboardHome";
import AppLayout from './AppLayout';
// import TicketsList from "./pages/TicketsList";
// import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// Tickets
import Tickets from "./pages/Tickets";
import NewTicket from "./pages/NewTicket";

// Assets
import AssetsPage from './pages/AssetsPage';
import AssetsList from "./pages/Assets/AssetsList";
import AssetDetail from "./pages/Assets/AssetDetail";
import AssetForm from "./pages/Assets/AssetForm";
import POList from "./pages/Procurement/POList";
import POReceive from "./pages/Procurement/POReceive";
import POCreate from "./pages/Procurement/POCreate";
import DepreciationLedger from "./pages/Dashboards/DepreciationLedger";
import SoftwareCompliance from "./pages/Dashboards/SoftwareCompliance";
import AssetWorkspace from "./workspace/AssetWorkspace";
// import Assets from "./pages/Assets";
import Assets from "./pages/Assets";
import AssetDashboard from "./pages/assets/AssetDashboard.jsx";
import AssetLifecycle from "./pages/AssetLifecycle.jsx";
import AssetsListMUI from "./pages/Assets/AssetsList.MUI";
import AssetWorkspaceMUI from "./pages/Assets/AssetWorkspace.MUI";
import POCreateMUI from "./pages/Procurement/POCreate.MUI";
import RecommendationsAdmin from "./pages/Admin/RecommendationsAdmin.MUI.jsx";
//import AssetNew from "./pages/AssetNew";
//import AssetEdit from "./pages/AssetEdit";
//import AssetDetails from "./pages/AssetDetails";


// Changes
import ChangeWorkspace from "./workspace/ChangeWorkspace";
import Changes from "./pages/Changes";
import ChangeDashboard from "./pages/change/ChangeDashboard.jsx";
import ChangeCalendar from "./pages/ChangeCalendar.jsx";
import ChangeHeatmap from "./pages/ChangeHeatmap.jsx";
//import ChangeNew from "./pages/ChangeNew";
//import ChangeEdit from "./pages/ChangeEdit";

// CMDB
import CMDBWorkspace from './workspace/CMDBWorkspace';
import CMDB from "./pages/CMDB.jsx";
import CMDBDetails from "./pages/CMDBDetails.jsx";
import CMDBDashboard from "./pages/cmdb/CMDBDashboard.jsx";
//import CMDBNew from "./pages/CMDBNew";
//import CMDBEdit from "./pages/CMDBEdit";
import Notifications from "./pages/Notifications";
import AddCI from "./pages/AddCI";
import EditCI from "./pages/EditCI";
import CIView from "./pages/CIView";
import CMDBRelations from "./components/CMDBRelations";


// KB
import KnowledgeBase from "./pages/KnowledgeBase";
import KBNew from "./pages/KBNew";
import KBArticleDetails from "./pages/KBArticleDetails";

// Admin
import AdminPanel from "./pages/AdminPanel";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import MainLayoutMUI from "./layouts/MainLayout.MUI";
import "./styles.css";

export default function App() {
  const location = useLocation();
  const authPages = ["/login", "/forgot-password", "/reset-password", "/reset-success"];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <div className={isAuthPage ? "auth-page" : ""}>
      <div className="hyperdrive-bg">
      <div className="hyperdrive-stars"></div>
      <div className="hyperdrive-plasma"></div>
    </div> 

      {/* AUTH PAGES — NO SIDEBAR */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />

        {/* Redirect root */}
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* PROTECTED ROUTES */}
        
        {/* Workspace */}
        <Route path="/workspace/cmdb" element={<ProtectedRoute><MainLayout><CMDBWorkspace /></MainLayout></ProtectedRoute>}/>
        <Route path="/workspace/assets" element={<ProtectedRoute><MainLayout><AssetWorkspace /></MainLayout></ProtectedRoute>}/>
        <Route path="/workspace/changes" element={<ProtectedRoute><MainLayout><ChangeWorkspace /></MainLayout></ProtectedRoute>}/>

        {/* Dashboard */}
        {/* <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardAdvanced /></MainLayout></ProtectedRoute>}/> */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardHome /></MainLayout></ProtectedRoute>} />
        {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}

        {/* Tickets */}
        {/* <Route path="/tickets" element={<Tickets />} /> */}
        {/* <Route path="/tickets" element={<TicketsList />} /> */}
        {/* <Route path="/tickets" element={<ProtectedRoute><MainLayout><Tickets /></MainLayout></ProtectedRoute>}/> */}
        <Route path="/tickets/new/:id" element={<ProtectedRoute><MainLayout> <RoleRoute permission="ticket:create"><NewTicket /></RoleRoute></MainLayout></ProtectedRoute>}/>

        {/* Assets */}
       
        <Route path="/assets" element={<ProtectedRoute><MainLayout><AssetsPage /></MainLayout></ProtectedRoute>}/>
        {/* <Route path="/assets" element={<AppLayout><Assets /></AppLayout>} /> */}
        {/* <Route path="/assets" element={<AssetsList />} /> */}
        {/* <Route path="/" element={<ProtectedRoute><MainLayout><AssetsList /></MainLayout></ProtectedRoute>} /> */}
        {/* <Route path="/assets" element={<ProtectedRoute><MainLayout><AssetsList /></MainLayout></ProtectedRoute>} /> */}
        <Route path="/assets/new" element={<ProtectedRoute><MainLayout><AssetForm /></MainLayout></ProtectedRoute>} />
        <Route path="/assets/:id" element={<ProtectedRoute><MainLayout><AssetDetail /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboards/depreciation" element={<ProtectedRoute><MainLayout><DepreciationLedger /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboards/software-compliance" element={<ProtectedRoute><MainLayout><SoftwareCompliance /></MainLayout></ProtectedRoute>} />
        {/* <Route path="/assets" element={<ProtectedRoute><MainLayout><Assets /></MainLayout></ProtectedRoute>}/> */}
        <Route path="asset-lifecycle" element={<ProtectedRoute><MainLayout><AssetLifecycle /></MainLayout></ProtectedRoute>}/> 
        <Route path="asset-dashboard" element={<ProtectedRoute><MainLayout><AssetDashboard /></MainLayout></ProtectedRoute>}/>
        <Route path="/assets/:id" element={<ProtectedRoute><MainLayout><AssetWorkspace /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/recommendations" element={<ProtectedRoute><MainLayout><RecommendationsAdmin /></MainLayout></ProtectedRoute>}/>
        {/*}
        <Route path="/assets/new" element={<ProtectedRoute><MainLayout><AssetNew /></MainLayout></ProtectedRoute>}/>
        <Routepath="/assets/:id" element={<ProtectedRoute><MainLayout><AssetEdit /></MainLayout></ProtectedRoute>}/>
        <Route path="/assets/details/:id" element={<ProtectedRoute><MainLayout><AssetDetails /></MainLayout></ProtectedRoute>}/>
        */}
       
        {/* Procurement */}
        <Route path="/procurement" element={<ProtectedRoute><MainLayout><POList /></MainLayout></ProtectedRoute>} />
        <Route path="/procurement/new" element={<ProtectedRoute><MainLayout><POCreate /></MainLayout></ProtectedRoute>}/>
        <Route path="/procurement/:poNumber/receive" element={<ProtectedRoute><MainLayout><POReceive /></MainLayout></ProtectedRoute>}/>
        <Route path="/procurement/new" element={<ProtectedRoute><MainLayout><POCreate /></MainLayout></ProtectedRoute>} />
        <Route path="/procurement/new" element={<ProtectedRoute><MainLayout><POCreate /></MainLayout></ProtectedRoute>}/>

        {/* Changes */}
        {/* <Route path="/changes" element={<Changes />} /> */}
        {/* <Route path="/changes" element={<ChangesList />} /> */}
        {/* <Route path="/changes" element={<ProtectedRoute><MainLayout><Changes /></MainLayout></ProtectedRoute>}/> */}
        {/* <Route path="/change-dashboard" element={<ProtectedRoute><MainLayout><ChangeDashboard /></MainLayout></ProtectedRoute>}/>
        // <Route path="/change-calendar" element={<ProtectedRoute><MainLayout><ChangeCalendar /></MainLayout></ProtectedRoute>}/> */}
        {/* <Route path="/change-heatmap" element={<ProtectedRoute> <MainLayout><ChangeHeatmap /></MainLayout></ProtectedRoute>}/>        */}
        {/* <Route path="/change-heatmap" element={<ProtectedRoute><MainLayout><ChangeHeatmap /></MainLayout></ProtectedRoute>}/> */}

        {/*}
        <Route path="/changes/new" element={<ProtectedRoute><MainLayout><ChangeNew /></MainLayout></ProtectedRoute>}/>
        <Route path="/changes/:id" element={<ProtectedRoute><MainLayout><ChangeEdit /></MainLayout></ProtectedRoute>}/>
        */}

        <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>}/>
        <Route path="/chatbot" element={<ProtectedRoute><MainLayout><Chatbot /></MainLayout></ProtectedRoute>}/>

        {/* CMDB */}
        <Route path="/cmdb" element={<AppLayout><CMDB /></AppLayout>} />
        {/* <Route path="/cmdb" element={<CMDB />} /> */}
        {/* <Route path="/cmdb" element={<ProtectedRoute><MainLayout><CMDB /></MainLayout></ProtectedRoute>}/> */}
        <Route path="/cmdb/new" element={<ProtectedRoute><MainLayout><AddCI /></MainLayout></ProtectedRoute>}/>
        <Route path="/cmdb/:id" element={<ProtectedRoute><MainLayout><EditCI /></MainLayout></ProtectedRoute>}/>
        <Route path="/cmdb/view/:id" element={<ProtectedRoute><MainLayout><CIView /></MainLayout></ProtectedRoute>} />
        <Route path="/cmdb-dashboard" element={<ProtectedRoute><MainLayout><CMDBDashboard /></MainLayout></ProtectedRoute>}/>
        <Route path="/cmdb/:id" element={<ProtectedRoute><MainLayout><CMDBDetails /></MainLayout></ProtectedRoute>}/>
        <Route path="/cmdb/relations" element={<ProtectedRoute><MainLayout><CMDBRelations /></MainLayout></ProtectedRoute>}/>

        {/* KB */}
        {/* <Route path="/kb" element={<KB />} /> */}
        {/* <Route path="/kb" element={<KnowledgeBase />} /> */}
        {/* <Route path="/kb" element={<ProtectedRoute><MainLayout><KnowledgeBase /></MainLayout></ProtectedRoute>}/> */}
        <Route path="/kb/new" element={<ProtectedRoute><MainLayout><KBNew /></MainLayout></ProtectedRoute>}/>
        <Route path="/kb/:id" element={<ProtectedRoute><MainLayout><KBArticleDetails /></MainLayout></ProtectedRoute>}/>

        {/* Admin */}
        {/* <Route path="/admin" element={<Admin />} /> */}
        {/* <Route path="/admin" element={<AdminPanel />} /> */}
        {/* <Route path="/admin" element={<ProtectedRoute><MainLayout><RoleRoute permission="user:manage"><AdminPanel /></RoleRoute></MainLayout></ProtectedRoute>}/> */}
      
        {/* Chat */}
        <Route path="/chat" element={<ProtectedRoute><MainLayout><Chatbot /></MainLayout></ProtectedRoute>}/>
        
        <Route path="/unauthorized" element={<h2>Unauthorized</h2>} />

      </Routes> 
  </div>
  );
}
