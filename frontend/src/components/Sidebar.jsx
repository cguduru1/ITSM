import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaTicketAlt,
  FaPlusCircle,
  FaDatabase,
  FaTools,
  FaBook,
  FaUserCog
} from "react-icons/fa";

export default function Sidebar() {
  return (

<aside className="sidebar">

  <div className="sidebar-logo">
    <img src="/s3-logo.png" alt="S3 Technologies" />
  </div>

  <nav className="sidebar-nav">

  <NavLink to="/cmdb-chatbot" className="nav-item" data-hide="true">
    <i className="ri-chatbot-line"></i>
    <span>CMDB Chatbot</span>
  </NavLink>

  <NavLink to="/chatbot" className="nav-item">
  <span>Chatbot</span>
</NavLink>


  <NavLink to="/chatbot" className="nav-item">
    <i className="ri-robot-line"></i>
    <span>Chatbot</span>
  </NavLink>

    <NavLink to="/dashboard" className="nav-item">
      <i className="ri-dashboard-line"></i>
      <span>Dashboard</span>
    </NavLink>

    <NavLink to="/tickets" className="nav-item">
      <i className="ri-ticket-line"></i>
      <span>Tickets</span>
    </NavLink>

    <NavLink to="/new-ticket" className="nav-item">
      <i className="ri-add-line"></i>
      <span>New Ticket</span>
    </NavLink>

    <NavLink to="/workspace/assets" className="nav-item">
      <i className="ri-database-2-line"></i>
      <span>Assets</span>
    </NavLink>

    <NavLink to="/workspace/changes" className="nav-item">
      <i className="ri-refresh-line"></i>
      <span>Changes</span>
    </NavLink>

    <NavLink to="/workspace/cmdb" className="nav-item">
      <i className="ri-stack-line"></i>
      <span>CMDB</span>
    </NavLink>

    <NavLink to="/knowledge" className="nav-item">
      <i className="ri-book-open-line"></i>
      <span>Knowledge Base</span>
    </NavLink>

    <NavLink to="/admin" className="nav-item">
      <i className="ri-settings-3-line"></i>
      <span>Admin</span>
    </NavLink>

  </nav>
</aside>

  );
}
