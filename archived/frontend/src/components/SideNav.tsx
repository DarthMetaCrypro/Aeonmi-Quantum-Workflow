import React from 'react';
import './SideNav.css';

interface SideNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const SideNav: React.FC<SideNavProps> = ({ activeView, onViewChange }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics'
    },
    {
      id: 'editor',
      label: 'Workflow Editor',
      icon: '⚡',
      description: 'Create & Edit Workflows'
    },
    {
      id: 'library',
      label: 'Workflow Library',
      icon: '📚',
      description: 'Pre-built Templates'
    },
    {
      id: 'security',
      label: 'Quantum Security',
      icon: '🔐',
      description: 'BB84 Key Management'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Configuration'
    }
  ];

  return (
    <nav className="side-nav">
      <div className="nav-header">
        <div className="quantum-brand">
          <div className="quantum-icon">Ψ</div>
          <span className="brand-text">QuantumForge</span>
        </div>
        <p className="nav-subtitle">AI Workflow Automation</p>
      </div>

      <div className="nav-menu">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <div className="nav-content">
              <span className="nav-label">{item.label}</span>
              <span className="nav-description">{item.description}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="nav-footer">
        <div className="quantum-status">
          <div className="status-dot"></div>
          <span>Quantum Core Online</span>
        </div>
      </div>
    </nav>
  );
};

export default SideNav;