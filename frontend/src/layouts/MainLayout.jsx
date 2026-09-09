// src/layouts/MainLayout.jsx
import React from 'react';
import LeftNav from '../components/LeftNav';
import TopBar from '../components/TopBar';
import { Outlet } from 'react-router-dom';

export default function MainLayout({ children }) {
  return (
    <div className="app-root">
      <LeftNav />
        <div className="main-container">
          <TopBar />
          <main className="app-content">
          {children || <Outlet />}
          </main>
        </div>
    </div>
  );
}
