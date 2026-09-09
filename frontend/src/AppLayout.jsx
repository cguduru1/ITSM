// AppLayout.jsx
import React from 'react';
import LeftNav from './LeftNav';
import TopBar from "./components/TopBar";
import Chatbot from './Chatbot';

export default function AppLayout({ children, user }) {
  // user should be passed from App or server
  const userProp = user || { name: 'Guest', isAdmin: false, unreadNotifications: 0 };

  return (
    <div className="app-root" data-theme={localStorage.getItem('theme') || 'light'}>
      <TopBar user={userProp} />
      <div className="app-body">
        <LeftNav isAdmin={userProp.isAdmin} />
        <main className="main-content" id="main" tabIndex="-1" aria-live="polite">
          {children}
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
