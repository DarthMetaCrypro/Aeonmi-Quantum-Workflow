import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import api from '../services/api';
import persistentWorkflowService from '../services/persistentWorkflowService';
import userService from '../services/userService';
import iotPolicyService, { IotPolicyState } from '../services/iotPolicyService';

interface SystemHealth {
  status: string;
  message: string;
  endpoints?: number;
  training_samples?: number;
}

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [healthStatus, setHealthStatus] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeWorkflows, setActiveWorkflows] = useState(0);
  const [quantumKeys, setQuantumKeys] = useState(0);
  const [recentWorkflows, setRecentWorkflows] = useState<any[]>([]);
  const [iotPolicy, setIotPolicy] = useState<IotPolicyState | null>(iotPolicyService.getPolicySnapshot());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Check backend health
      const health = await api.checkHealth();
      if (health.status === 'success' && health.result) {
        setHealthStatus(health.result);
      }

      // Get workflow count and recent workflows
      if (userService.getCurrentUser()) {
        const response = await persistentWorkflowService.getUserWorkflows();
        if (response.status === 'success' && response.result) {
          setActiveWorkflows(response.result.length);
          const recent = response.result.slice(0, 5).map(wf => ({
            name: wf.name,
            status: 'ready',
            time: 'just now',
            type: wf.category.toLowerCase()
          }));
          setRecentWorkflows(recent);
        }
      }

      // Simulate quantum key count (would be from BB84 integration)
      setQuantumKeys(3);

      const policyResponse = await iotPolicyService.fetchPolicy();
      if (policyResponse.status === 'success' && policyResponse.result) {
        setIotPolicy(policyResponse.result);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Active Workflows', value: activeWorkflows.toString(), icon: '⚡', change: '+2', trend: 'up' },
    { label: 'Quantum Keys', value: quantumKeys.toString(), icon: '🔑', change: '0', trend: 'stable' },
    { label: 'AI Optimizations', value: '47', icon: '🤖', change: '+8', trend: 'up' },
    { label: 'Security Events', value: '0', icon: '🛡️', change: '0', trend: 'stable' },
    {
      label: 'Micro AI Agents',
      value: iotPolicy ? (iotPolicy.micro_ai_enabled ? 'Enabled' : 'Blocked') : 'Syncing',
      icon: '📡',
      change: iotPolicy ? (iotPolicy.micro_ai_enabled ? '+Edge' : '-Edge') : '...',
      trend: iotPolicy ? (iotPolicy.micro_ai_enabled ? 'up' : 'down') : 'pending'
    }
  ];

  const quantumMetrics = [
    { label: 'Backend Status', value: healthStatus?.status || 'checking', status: healthStatus?.status === 'online' ? 'excellent' : 'pending' },
    { label: 'API Endpoints', value: healthStatus?.endpoints?.toString() || '-', status: 'good' },
    { label: 'Training Samples', value: healthStatus?.training_samples?.toString() || '-', status: 'excellent' },
    { label: 'Connection', value: loading ? 'connecting' : 'active', status: loading ? 'pending' : 'good' },
    {
      label: 'IoT Compliance',
      value: iotPolicy ? (iotPolicy.micro_ai_enabled ? 'Micro AI allowed' : 'Micro AI blocked') : 'Syncing',
      status: iotPolicy ? (iotPolicy.micro_ai_enabled ? 'good' : 'warning') : 'pending'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>QuantumForge Dashboard</h1>
        <p>Real-time quantum workflow automation overview</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className={`stat-change ${stat.trend}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Recent Workflows</h2>
          <div className="workflow-list">
            {recentWorkflows.map((workflow, index) => (
              <div key={index} className="workflow-item">
                <div className="workflow-info">
                  <h3>{workflow.name}</h3>
                  <span className="workflow-time">{workflow.time}</span>
                </div>
                <div className={`workflow-status ${workflow.status}`}>
                  {workflow.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quantum Performance</h2>
          <div className="metrics-grid">
            {quantumMetrics.map((metric, index) => (
              <div key={index} className="metric-item">
                <div className="metric-label">{metric.label}</div>
                <div className="metric-value">{metric.value}</div>
                <div className={`metric-status ${metric.status}`}>
                  {metric.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-button primary" onClick={() => onNavigate?.('security')}>
              <span className="action-icon">🔑</span>
              Generate Quantum Key
            </button>
            <button className="action-button secondary" onClick={() => onNavigate?.('editor')}>
              <span className="action-icon">⚡</span>
              Create Workflow
            </button>
            <button className="action-button secondary" onClick={() => onNavigate?.('library')}>
              <span className="action-icon">📚</span>
              Browse Library
            </button>
            <button className="action-button secondary" onClick={() => onNavigate?.('settings')}>
              <span className="action-icon">⚙️</span>
              Settings
            </button>
          </div>
        </div>

        <div className="dashboard-section full-width">
          <h2>System Health</h2>
          <div className="health-overview">
            <div className="health-item">
              <span className="health-label">Quantum Core</span>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '98%' }}></div>
              </div>
              <span className="health-value">98%</span>
            </div>
            <div className="health-item">
              <span className="health-label">AI Engine</span>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '95%' }}></div>
              </div>
              <span className="health-value">95%</span>
            </div>
            <div className="health-item">
              <span className="health-label">Security Module</span>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '100%' }}></div>
              </div>
              <span className="health-value">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;