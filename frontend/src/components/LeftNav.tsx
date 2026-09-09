// LeftNav.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import logoImg from '../assets/s3-logo.png';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/tickets', label: 'Tickets', icon: '⚡' },
  { to: '/assets', label: 'Assets', icon: '💎' },
  { to: '/procurement', label: 'Procurement', icon: '⭐' },
  { to: '/change-module', label: 'Changes', icon: '🔧' },   // FIXED
  { to: '/cmdb', label: 'CMDB', icon: '🧬' },
  { to: '/kb', label: 'Knowledgebase', icon: '📡' },
];

export default function LeftNav({ isAdmin }) {
  return (
    <nav className="left-nav" aria-label="Main modules">

      {/* Logo Header */}
      <div className="nav-header" style={{ padding: '20px 16px 10px 16px' }}>
        <img 
          src={logoImg} 
          alt="S3 Technologies" 
          style={{ width: '120px', height: 'auto', display: 'block' }} 
        />
      </div>

      <ul>
        {navItems.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              aria-current={undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          </li>
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <li>
            <NavLink to="/admin" className="nav-item" aria-label="Admin">
              <span className="nav-icon" aria-hidden="true">⚙️</span>
              <span className="nav-label">Admin</span>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
