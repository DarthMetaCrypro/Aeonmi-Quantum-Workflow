import React, { useEffect, useMemo, useState } from 'react';
import './SettingsPanel.css';
import iotPolicyService, { IotPolicyState } from '../services/iotPolicyService';

interface Setting {
  id: string;
  name: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'slider';
  value: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

interface SettingGroup {
  title: string;
  icon: string;
  settings: Setting[];
  footer?: string;
}

const SettingsPanel: React.FC = () => {
  const snapshot = useMemo(() => iotPolicyService.getPolicySnapshot(), []);
  const [iotPolicy, setIotPolicy] = useState<IotPolicyState | null>(snapshot);
  const [settings, setSettings] = useState<Record<string, any>>({
    quantumBackend: 'qiskit',
    autoSave: true,
    theme: 'dark',
    notifications: true,
    securityLevel: 'high',
    maxConcurrentWorkflows: 5,
    enableAI: true,
    logLevel: 'info',
    backupFrequency: 'daily',
    apiTimeout: 30,
    constructorWidth: 380,
    constructorHeight: 600,
    iotMicroAiEnabled: snapshot ? snapshot.micro_ai_enabled : true
  });

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const response = await iotPolicyService.fetchPolicy();
        if (response.status === 'success' && response.result) {
          setIotPolicy(response.result);
          setSettings(prev => ({
            ...prev,
            iotMicroAiEnabled: response.result.micro_ai_enabled
          }));
        }
      } catch (error) {
        console.warn('Failed to fetch IoT policy', error);
      }
    };

    loadPolicy();
  }, []);

  const iotPolicyFooter = useMemo(() => {
    if (!iotPolicy) {
      return 'IoT compliance status syncing...';
    }

    const timestamp = iotPolicy.enforced_at ? new Date(iotPolicy.enforced_at) : null;
    const formattedTimestamp = timestamp ? timestamp.toLocaleString() : 'recently';
    const reason = iotPolicy.reason ? `Reason: ${iotPolicy.reason}` : 'Managed by IoT policy.';
    return `${formattedTimestamp} • ${reason}`;
  }, [iotPolicy]);

  const settingGroups: SettingGroup[] = [
    {
      title: 'Quantum Computing',
      icon: '⚛️',
      settings: [
        {
          id: 'quantumBackend',
          name: 'Quantum Backend',
          description: 'Choose quantum computing framework',
          type: 'select' as const,
          value: settings.quantumBackend,
          options: ['qiskit', 'cirq', 'qsharp', 'aeonmi']
        },
        {
          id: 'maxConcurrentWorkflows',
          name: 'Max Concurrent Workflows',
          description: 'Maximum number of quantum workflows running simultaneously',
          type: 'slider' as const,
          value: settings.maxConcurrentWorkflows,
          min: 1,
          max: 10,
          step: 1
        }
      ]
    },
    {
      title: 'AI & Automation',
      icon: '🤖',
      settings: [
        {
          id: 'enableAI',
          name: 'Enable AI Features',
          description: 'Allow AI-powered workflow optimization and suggestions',
          type: 'toggle' as const,
          value: settings.enableAI
        },
        {
          id: 'autoSave',
          name: 'Auto-save Workflows',
          description: 'Automatically save workflow changes',
          type: 'toggle' as const,
          value: settings.autoSave
        }
      ]
    },
    {
      title: 'IoT & Edge Compliance',
      icon: '📡',
      settings: [
        {
          id: 'iotMicroAiEnabled',
          name: 'Allow Micro AI Agents',
          description: settings.iotMicroAiEnabled
            ? 'Micro AI co-processors are available to workflows.'
            : 'Micro AI agents are disabled to satisfy IoT compliance.',
          type: 'toggle',
          value: settings.iotMicroAiEnabled
        }
      ],
      footer: iotPolicyFooter
    },
    {
      title: 'Security',
      icon: '🔐',
      settings: [
        {
          id: 'securityLevel',
          name: 'Security Level',
          description: 'Quantum security protocol strength',
          type: 'select' as const,
          value: settings.securityLevel,
          options: ['basic', 'standard', 'high', 'maximum']
        },
        {
          id: 'backupFrequency',
          name: 'Backup Frequency',
          description: 'How often to backup encrypted workflow data',
          type: 'select' as const,
          value: settings.backupFrequency,
          options: ['hourly', 'daily', 'weekly', 'manual']
        }
      ]
    },
    {
      title: 'Interface',
      icon: '🎨',
      settings: [
        {
          id: 'theme',
          name: 'Theme',
          description: 'Application color scheme',
          type: 'select' as const,
          value: settings.theme,
          options: ['dark', 'light', 'quantum', 'auto']
        },
        {
          id: 'notifications',
          name: 'Enable Notifications',
          description: 'Show system and workflow notifications',
          type: 'toggle' as const,
          value: settings.notifications
        },
        {
          id: 'constructorWidth',
          name: 'Constructor Width',
          description: 'Width of the Constructor AI assistant (pixels)',
          type: 'slider' as const,
          value: settings.constructorWidth,
          min: 300,
          max: 800,
          step: 20
        },
        {
          id: 'constructorHeight',
          name: 'Constructor Height',
          description: 'Height of the Constructor AI assistant (pixels)',
          type: 'slider' as const,
          value: settings.constructorHeight,
          min: 400,
          max: 800,
          step: 20
        }
      ]
    },
    {
      title: 'System',
      icon: '⚙️',
      settings: [
        {
          id: 'logLevel',
          name: 'Log Level',
          description: 'Detail level for system logging',
          type: 'select' as const,
          value: settings.logLevel,
          options: ['error', 'warn', 'info', 'debug']
        },
        {
          id: 'apiTimeout',
          name: 'API Timeout (seconds)',
          description: 'Timeout for API calls to quantum services',
          type: 'input' as const,
          value: settings.apiTimeout
        }
      ]
    }
  ];

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));

    if (settingId === 'iotMicroAiEnabled') {
      syncIotPolicy(value);
    }
  };

  const syncIotPolicy = async (enabled: boolean) => {
    try {
      const response = await iotPolicyService.setMicroAiEnabled(
        enabled,
        enabled ? 'Micro AI agents re-enabled from settings panel' : 'Micro AI agents disabled for IoT edge compatibility'
      );

      if (response.status === 'success' && response.result) {
        setIotPolicy(response.result);
      } else {
        throw new Error(response.message || 'Policy update failed');
      }
    } catch (error) {
      console.error('Failed to update IoT policy', error);
      setSettings(prev => ({
        ...prev,
        iotMicroAiEnabled: !enabled
      }));
      alert('Unable to update IoT micro AI policy. Please try again.');
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('quantumforge-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      quantumBackend: 'qiskit',
      autoSave: true,
      theme: 'dark',
      notifications: true,
      securityLevel: 'high',
      maxConcurrentWorkflows: 5,
      enableAI: true,
      logLevel: 'info',
      backupFrequency: 'daily',
      apiTimeout: 30,
      constructorWidth: 380,
      constructorHeight: 600,
      iotMicroAiEnabled: true
    };
    setSettings(defaultSettings);
    localStorage.setItem('quantumforge-settings', JSON.stringify(defaultSettings));
    alert('Settings reset to defaults!');
  };

  const renderSettingControl = (setting: Setting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        );

      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="setting-select"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );

      case 'input':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
            className="setting-input"
            min={setting.min}
            max={setting.max}
            step={setting.step}
          />
        );

      case 'slider':
        return (
          <div className="slider-container">
            <input
              type="range"
              value={setting.value}
              onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
              className="setting-slider"
              min={setting.min}
              max={setting.max}
              step={setting.step}
            />
            <span className="slider-value">{setting.value}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-panel">
      <div className="panel-header">
        <h1>Settings</h1>
        <p>Configure QuantumForge preferences and system options</p>
      </div>

      <div className="settings-content">
        {settingGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="settings-group">
            <div className="group-header">
              <span className="group-icon">{group.icon}</span>
              <h2>{group.title}</h2>
            </div>

            <div className="group-settings">
              {group.settings.map((setting, settingIndex) => (
                <div key={settingIndex} className="setting-item">
                  <div className="setting-info">
                    <h3>{setting.name}</h3>
                    <p>{setting.description}</p>
                  </div>
                  <div className="setting-control">
                    {renderSettingControl(setting)}
                  </div>
                </div>
              ))}
            </div>
            {group.footer && (
              <div className="settings-group-footer">
                {group.footer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="settings-actions">
        <button className="btn-secondary" onClick={handleResetSettings}>Reset to Defaults</button>
        <button className="btn-primary" onClick={handleSaveSettings}>Save Settings</button>
      </div>
    </div>
  );
};

export default SettingsPanel;