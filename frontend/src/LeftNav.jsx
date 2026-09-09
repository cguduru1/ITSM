// LeftNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import logoImg from './assets/s3-logo.png';
import waterImg from './assets/s3-watermark.png';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },   // Home on top
  { to: '/tickets', label: 'Tickets', icon: '⚡' },
  { to: '/assets', label: 'Assets', icon: '💎' },
  { to: '/procurement', label: 'Procurement', icon: '💎' },
  { to: '/changes', label: 'Change', icon: '🔧' },
  { to: '/cmdb', label: 'CMDB', icon: '🧬' },
  { to: '/kb', label: 'Knowledgebase', icon: '📡' },
];

export default function LeftNav({ isAdmin }) {
  return (
    <nav className="left-nav" aria-label="Main modules">
      {/* Logo Header Container */}
      <div className="nav-header" style={{ display: 'flex',flexDirection: 'column',alignItems: 'flex-start',padding: '16px 16px 8px 16px',gap: '12px' }}>
       <h2 style={{ position: 'relative', zIndex: 2, margin: 0, fontSize: '20px', fontWeight: '800', color: '#000000' }}>
          S3 Technologies
        </h2>
        {/* 1. Logo Image */}
        <img src={logoImg} alt="S3 Technologies Logo" style={{ width: '110px', height: 'auto', display: 'block' }}/>
        
        {/* 2. Watermark Background Image */}
        <img src={waterImg} alt="" aria-hidden="true" style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '100px', opacity: 0.15, pointerEvents: 'none', zIndex: 1}}/>      
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
