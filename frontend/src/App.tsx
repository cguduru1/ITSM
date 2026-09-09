import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AppThemeProvider } from "./components/ThemeProvider";
import TopBar from "./components/TopBar";
import LeftNav from "./components/LeftNav";
import DashboardHome from "./pages/DashboardHome";
import AssetsList from "./pages/AssetsList";
import TicketsList from "./pages/TicketsList";
import ChangesList from "./pages/ChangesList";
import CMDB from "./pages/CMDB";
import KnowledgeBase from "./pages/KnowledgeBase";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <AppThemeProvider>
      <div className="app-shell">
        <LeftNav />
        <div className="content">
          <TopBar />
          <main className="main-canvas">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/assets" element={<AssetsList />} />
              <Route path="/tickets" element={<TicketsList />} />
              <Route path="/changes" element={<ChangesList />} />
              <Route path="/cmdb" element={<CMDB />} />
              <Route path="/kb" element={<KnowledgeBase />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>
        </div>
      </div>
    </AppThemeProvider>
  );
}
