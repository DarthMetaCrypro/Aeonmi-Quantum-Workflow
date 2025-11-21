import React, { useState } from 'react';
import './App.css';
import SideNav from './components/SideNav';
import WorkflowEditor from './components/WorkflowEditor';
import QuantumSecurityPanel from './components/QuantumSecurityPanel';
import WorkflowLibrary from './components/WorkflowLibrary';
import SettingsPanel from './components/SettingsPanel';
import Dashboard from './components/Dashboard';
import Constructor from './components/Constructor';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveView} />;
      case 'editor':
        return <WorkflowEditor />;
      case 'library':
        return <WorkflowLibrary />;
      case 'security':
        return <QuantumSecurityPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard onNavigate={setActiveView} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="quantum-forge-app">
        <div className="auth-screen">
          <div className="quantum-header">
            <div className="quantum-logo">
              <div className="quantum-symbol">Ψ</div>
              <h1>QuantumForge</h1>
            </div>
            <p className="tagline">Revolutionary Quantum Workflow Automation</p>
          </div>
          <div className="auth-form">
            <h2>Secure Access</h2>
            <p>BB84 Quantum Key Distribution Active</p>
            <button
              className="quantum-auth-btn"
              onClick={() => setIsAuthenticated(true)}
            >
              Authenticate with Quantum Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quantum-forge-app">
      <SideNav activeView={activeView} onViewChange={setActiveView} />
      <main className="main-content">
        <header className="app-header">
          <h1>QuantumForge</h1>
          <div className="header-actions">
            <div className="quantum-status">
              <span className="status-indicator online"></span>
              Quantum Security: Active
            </div>
            <button className="logout-btn" onClick={() => setIsAuthenticated(false)}>
              Logout
            </button>
          </div>
        </header>
        <div className="content-area">
          {renderActiveView()}
        </div>
      </main>

      {/* Constructor AI Assistant - Always Available */}
      <Constructor />
    </div>
  );
}

export default App;