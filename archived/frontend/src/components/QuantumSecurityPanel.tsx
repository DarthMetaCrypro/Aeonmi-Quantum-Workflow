import React, { useState, useEffect } from 'react';
import quantumSecurityService from '../services/quantumSecurityService';
import { KeyGenerationResult } from '../types/tauri';
import './QuantumSecurityPanel.css';

interface KeyStats {
  keyLength: number;
  errorRate: number;
  eavesdroppingDetected: boolean;
  rawKeyLength: number;
  finalKeyLength: number;
}

const QuantumSecurityPanel: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [currentKey, setCurrentKey] = useState<KeyGenerationResult | null>(null);
  const [keyHistory, setKeyHistory] = useState<KeyGenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTauriMode, setIsTauriMode] = useState(false);
  const [quantumStatus, setQuantumStatus] = useState<{
    active: boolean;
    protocol: string;
    version: string;
    ready: boolean;
  } | null>(null);
  const [stats, setStats] = useState<KeyStats | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [eveInterceptRate, setEveInterceptRate] = useState(0.3);

  useEffect(() => {
    checkQuantumStatus();
    loadKeyHistory();
  }, []);

  const checkQuantumStatus = async () => {
    setIsTauriMode(quantumSecurityService.isTauriMode());
    
    if (quantumSecurityService.isTauriMode()) {
      try {
        const status = await quantumSecurityService.getStatus();
        setQuantumStatus(status);
      } catch (error) {
        console.error('Failed to get quantum status:', error);
      }
    }
  };

  const loadKeyHistory = () => {
    const history = quantumSecurityService.getKeyHistory();
    setKeyHistory(history);
    
    const current = quantumSecurityService.getCurrentKey();
    if (current) {
      setCurrentKey(current);
      setStats(quantumSecurityService.getKeyStats());
    }
  };

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    try {
      if (isTauriMode) {
        // Real quantum key generation in desktop mode
        const result = await quantumSecurityService.generateSecureKey(256);
        setCurrentKey(result);
        setStats(quantumSecurityService.getKeyStats());
        loadKeyHistory();
        alert('Quantum key generated successfully!');
      } else {
        // Demo mode for web browsers
        const demoKey = {
          id: `demo-key-${Date.now()}`,
          key: Array.from({length: 32}, () => Math.floor(Math.random() * 256)),
          length: 256,
          algorithm: 'BB84-Demo',
          created_at: new Date().toISOString(),
          error_rate: Math.random() * 0.05, // Random error rate < 5%
          eavesdropping_detected: Math.random() > 0.8, // 20% chance of detection
          raw_key_length: 512,
          final_key_length: 256
        };

        setCurrentKey(demoKey as any);
        setStats({
          keyLength: 256,
          errorRate: demoKey.error_rate,
          eavesdroppingDetected: demoKey.eavesdropping_detected,
          rawKeyLength: 512,
          finalKeyLength: 256
        });

        // Add to history
        const history = quantumSecurityService.getKeyHistory();
        history.unshift(demoKey as any);
        localStorage.setItem('quantum-keys', JSON.stringify(history));

        alert(`Demo quantum key generated!\nLength: ${demoKey.length} bits\nError Rate: ${(demoKey.error_rate * 100).toFixed(2)}%\n${demoKey.eavesdropping_detected ? '⚠️ Eavesdropping Detected!' : '✅ Secure'}`);
      }
    } catch (error) {
      console.error('Key generation failed:', error);
      alert('Failed to generate quantum key: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestEavesdropping = async () => {
    if (!isTauriMode) {
      alert('Eavesdropping test requires desktop mode (Tauri)');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await quantumSecurityService.testEavesdroppingDetection(
        256,
        eveInterceptRate
      );
      setCurrentKey(result);
      setStats(quantumSecurityService.getKeyStats());
      loadKeyHistory();
      
      if (result.eavesdropping_detected) {
        alert(`⚠️ EAVESDROPPING DETECTED!\nError Rate: ${(result.error_rate * 100).toFixed(2)}%`);
      } else {
        alert(`✅ No eavesdropping detected\nError Rate: ${(result.error_rate * 100).toFixed(2)}%`);
      }
    } catch (error) {
      console.error('Eavesdropping test failed:', error);
      alert('Failed to test eavesdropping: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearKey = () => {
    quantumSecurityService.clearCurrentKey();
    setCurrentKey(null);
    setStats(null);
  };

  const handleClearAllKeys = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to clear all quantum keys from memory?')) {
      quantumSecurityService.clearAllKeys();
      setCurrentKey(null);
      setStats(null);
      setKeyHistory([]);
    }
  };

  const assessment = currentKey ? quantumSecurityService.getSecurityAssessment() : null;
  const visualization = currentKey ? quantumSecurityService.getVisualizationData() : null;

  const securityStats = [
    { 
      label: 'Active Keys', 
      value: currentKey ? '1' : '0', 
      icon: '🔑' 
    },
    { 
      label: 'Key Length', 
      value: stats ? `${stats.keyLength}-bit` : 'N/A', 
      icon: '📏' 
    },
    { 
      label: 'Eavesdropping', 
      value: stats?.eavesdroppingDetected ? 'DETECTED' : 'Clear', 
      icon: stats?.eavesdroppingDetected ? '⚠️' : '🛡️' 
    },
    { 
      label: 'Error Rate', 
      value: stats ? `${(stats.errorRate * 100).toFixed(3)}%` : 'N/A', 
      icon: '📊' 
    }
  ];

  return (
    <div className="security-panel">
      <div className="panel-header">
        <h1>Quantum Security Management</h1>
        <p>BB84 Quantum Key Distribution Control Center</p>
        {!isTauriMode && (
          <div className="warning-banner">
            ⚠️ Running in web mode. Quantum key generation requires desktop application.
          </div>
        )}
        {quantumStatus && (
          <div className="status-banner">
            ✅ {quantumStatus.protocol} v{quantumStatus.version} - {quantumStatus.ready ? 'Ready' : 'Initializing'}
          </div>
        )}
      </div>

      <div className="security-stats">
        {securityStats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="security-actions">
        <button 
          className="btn-primary" 
          onClick={handleGenerateKey}
          disabled={isGenerating || !isTauriMode}
        >
          <span className="btn-icon">🔐</span>
          {isGenerating ? 'Generating...' : 'Generate New Key'}
        </button>
        <button 
          className="btn-secondary"
          onClick={handleTestEavesdropping}
          disabled={isGenerating || !isTauriMode}
        >
          <span className="btn-icon">🔬</span>
          Test Eavesdropping Detection
        </button>
        <button 
          className="btn-secondary"
          onClick={handleClearKey}
          disabled={!currentKey}
        >
          <span className="btn-icon">🗑️</span>
          Clear Current Key
        </button>
        <button 
          className="btn-danger"
          onClick={handleClearAllKeys}
          disabled={keyHistory.length === 0}
        >
          <span className="btn-icon">⚠️</span>
          Clear All Keys
        </button>
      </div>

      {testMode && (
        <div className="test-controls">
          <h3>Eavesdropper Simulation</h3>
          <label>
            Eve Intercept Rate: {(eveInterceptRate * 100).toFixed(0)}%
            <input
              type="range"
              min="0"
              max="100"
              value={eveInterceptRate * 100}
              onChange={(e) => setEveInterceptRate(Number(e.target.value) / 100)}
            />
          </label>
          <button onClick={() => setTestMode(false)}>Hide Controls</button>
        </div>
      )}

      {!testMode && isTauriMode && (
        <button className="btn-link" onClick={() => setTestMode(true)}>
          Show Test Controls
        </button>
      )}

      {currentKey && (
        <div className="current-key-section">
          <h2>Current Quantum Key</h2>
          <div className="key-display">
            <div className="key-field">
              <label>Key (Hex):</label>
              <code>{currentKey.key_hex}</code>
            </div>
            <div className="key-metrics">
              <div className="metric">
                <span>Raw Key Length:</span>
                <strong>{stats?.rawKeyLength || 0} bits</strong>
              </div>
              <div className="metric">
                <span>Final Key Length:</span>
                <strong>{stats?.finalKeyLength || 0} bits</strong>
              </div>
              <div className="metric">
                <span>Error Rate:</span>
                <strong className={stats?.errorRate && stats.errorRate > 0.11 ? 'error' : 'success'}>
                  {((stats?.errorRate || 0) * 100).toFixed(3)}%
                </strong>
              </div>
              <div className="metric">
                <span>Security Status:</span>
                <strong className={stats?.eavesdroppingDetected ? 'error' : 'success'}>
                  {stats?.eavesdroppingDetected ? '⚠️ COMPROMISED' : '✅ SECURE'}
                </strong>
              </div>
            </div>
          </div>

          {assessment && (
            <div className={`security-assessment ${assessment.secure ? 'secure' : 'insecure'}`}>
              <h3>Security Assessment</h3>
              <p>{assessment.recommendation}</p>
            </div>
          )}

          {visualization && (
            <div className="visualization-section">
              <h3>BB84 Protocol Visualization</h3>
              <div className="basis-comparison">
                <div className="basis-row">
                  <span className="label">Alice Bases:</span>
                  <code>{visualization.aliceBases.slice(0, 50).join(' ')}</code>
                </div>
                <div className="basis-row">
                  <span className="label">Bob Bases:</span>
                  <code>{visualization.bobBases.slice(0, 50).join(' ')}</code>
                </div>
                <div className="basis-row">
                  <span className="label">Matching:</span>
                  <code>
                    {visualization.matchingBases.slice(0, 50).map((match, i) => (
                      <span key={i} className={match ? 'match' : 'no-match'}>
                        {match ? '✓' : '✗'}
                      </span>
                    ))}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="keys-section">
        <h2>Key Generation History ({keyHistory.length})</h2>
        <div className="keys-list">
          {keyHistory.map((key, index) => (
            <div
              key={index}
              className={`key-item ${selectedKey === String(index) ? 'selected' : ''} ${
                key.eavesdropping_detected ? 'compromised' : 'secure'
              }`}
              onClick={() => setSelectedKey(String(index))}
            >
              <div className="key-header">
                <h3>Key #{keyHistory.length - index}</h3>
                <span className={`key-status ${key.eavesdropping_detected ? 'compromised' : 'secure'}`}>
                  {key.eavesdropping_detected ? 'Compromised' : 'Secure'}
                </span>
              </div>
              <div className="key-details">
                <div className="key-metric">
                  <span className="metric-label">Length:</span>
                  <span className="metric-value">{key.final_key.length}-bit</span>
                </div>
                <div className="key-metric">
                  <span className="metric-label">Error Rate:</span>
                  <span className="metric-value">{(key.error_rate * 100).toFixed(3)}%</span>
                </div>
                <div className="key-metric">
                  <span className="metric-label">Key (Hex):</span>
                  <span className="metric-value">
                    <code>{key.key_hex.substring(0, 16)}...</code>
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {keyHistory.length === 0 && (
            <div className="empty-state">
              <p>No quantum keys generated yet.</p>
              <p>Click "Generate New Key" to create your first quantum-secure key.</p>
            </div>
          )}
        </div>
      </div>

      <div className="security-monitor">
        <h2>Real-time Security Monitor</h2>
        <div className="monitor-grid">
          <div className="monitor-item">
            <h3>Quantum Channel Status</h3>
            <div className="channel-status">
              <div className={`status-indicator ${currentKey && !currentKey.eavesdropping_detected ? 'secure' : 'inactive'}`}></div>
              <span>{currentKey && !currentKey.eavesdropping_detected ? 'Secure' : 'Inactive'}</span>
            </div>
          </div>
          <div className="monitor-item">
            <h3>Eavesdropping Detection</h3>
            <div className="detection-status">
              <div className={`status-indicator ${currentKey?.eavesdropping_detected ? 'danger' : 'clear'}`}></div>
              <span>{currentKey?.eavesdropping_detected ? 'THREAT DETECTED' : 'No Threats Detected'}</span>
            </div>
          </div>
          <div className="monitor-item">
            <h3>Protocol Status</h3>
            <div className="protocol-status">
              <div className={`status-indicator ${isTauriMode ? 'active' : 'inactive'}`}></div>
              <span>{isTauriMode ? 'BB84 Active' : 'Web Mode'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumSecurityPanel;