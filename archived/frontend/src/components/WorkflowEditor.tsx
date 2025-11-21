import React, { useCallback, useEffect, useRef, useState } from 'react';
import './WorkflowEditor.css';
import persistentWorkflowService, { SavedWorkflow } from '../services/persistentWorkflowService';
import userService from '../services/userService';
import iotPolicyService, { IotPolicyState } from '../services/iotPolicyService';

type NodeType = 'input' | 'process' | 'output' | 'quantum' | 'ai' | 'api' | 'social' | 'law' | 'evolve' | 'invest' | 'app' | 'email' | 'sheets' | 'slack' | 'drive' | 'webhook' | 'http' | 'crypto' | 'assistant';

interface BaseNodeConfig {
  description?: string;
  microAgents: MicroAiConfig[];
  microAiBlueprint?: string; // Quantum algorithm ID for generating agents
}

interface InputNodeConfig extends BaseNodeConfig {
  source: 'dataset' | 'api' | 'sensor';
  autoRefresh: boolean;
}

interface ProcessNodeConfig extends BaseNodeConfig {
  script: string;
  retries: number;
}

interface OutputNodeConfig extends BaseNodeConfig {
  destination: 'dashboard' | 'storage' | 'api';
  notifyOnCompletion: boolean;
}

interface QuantumNodeConfig extends BaseNodeConfig {
  shots: number;
  useHardware: boolean;
}

interface AiNodeConfig extends BaseNodeConfig {
  model: 'gpt' | 'custom';
  temperature: number;
}

interface ApiNodeConfig extends BaseNodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  authType: 'none' | 'bearer' | 'basic' | 'api-key';
  authToken?: string;
  timeout: number;
}

interface SocialNodeConfig extends BaseNodeConfig {
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube';
  action: 'post' | 'schedule' | 'analyze' | 'optimize';
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  scheduleTime?: Date;
  viralOptimization: boolean;
}

interface LawNodeConfig extends BaseNodeConfig {
  caseType: 'missing-person' | 'investigation' | 'evidence-analysis' | 'logical-reasoning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  jurisdiction: string;
  evidence: string[];
  suspects: string[];
  timeline: Date[];
}

interface EvolveNodeConfig extends BaseNodeConfig {
  evolutionType: 'performance' | 'accuracy' | 'efficiency' | 'creativity';
  learningRate: number;
  adaptationThreshold: number;
  feedbackLoop: boolean;
  historicalData: any[];
}

interface InvestNodeConfig extends BaseNodeConfig {
  investmentType: 'stocks' | 'crypto' | 'forex' | 'options' | 'bonds';
  strategy: 'conservative' | 'moderate' | 'aggressive' | 'quantitative';
  riskTolerance: 'low' | 'medium' | 'high';
  portfolioSize: number;
  autoTrade: boolean;
  exchanges: string[];
}

interface AppNodeConfig extends BaseNodeConfig {
  appType: 'web' | 'mobile' | 'desktop' | 'api' | 'ai-agent';
  framework: 'react' | 'vue' | 'angular' | 'flutter' | 'electron' | 'fastapi' | 'custom';
  features: string[];
  deployment: 'vercel' | 'netlify' | 'aws' | 'azure' | 'gcp' | 'heroku';
  autoDeploy: boolean;
}

interface EmailNodeConfig extends BaseNodeConfig {
  provider: 'gmail' | 'outlook' | 'sendgrid' | 'smtp';
  operation: 'send' | 'receive' | 'filter' | 'forward';
  template: string;
  recipients: string[];
  subject: string;
  attachments: string[];
}

interface SheetsNodeConfig extends BaseNodeConfig {
  operation: 'read' | 'write' | 'update' | 'append' | 'clear';
  spreadsheetId: string;
  sheetName: string;
  range: string;
  values: any[][];
  headers: boolean;
}

interface SlackNodeConfig extends BaseNodeConfig {
  operation: 'send' | 'receive' | 'create-channel' | 'invite-user';
  channel: string;
  message: string;
  attachments: any[];
  reactions: string[];
}

interface DriveNodeConfig extends BaseNodeConfig {
  operation: 'upload' | 'download' | 'list' | 'delete' | 'share';
  fileId?: string;
  folderId?: string;
  fileName: string;
  mimeType: string;
  permissions: any[];
}

interface WebhookNodeConfig extends BaseNodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  payload: any;
  authentication: 'none' | 'basic' | 'bearer' | 'api-key';
}

interface HttpNodeConfig extends BaseNodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body: any;
  authentication: 'none' | 'basic' | 'bearer' | 'oauth2' | 'api-key';
  timeout: number;
  retries: number;
}

interface CryptoNodeConfig extends BaseNodeConfig {
  exchange: 'binance' | 'coinbase' | 'kraken' | 'bybit' | 'custom';
  operation: 'buy' | 'sell' | 'price' | 'balance' | 'history';
  symbol: string;
  amount: number;
  strategy: 'manual' | 'dca' | 'grid' | 'arbitrage';
  apiKey: string;
  secretKey: string;
}

interface AssistantNodeConfig extends BaseNodeConfig {
  assistantType: 'constructor' | 'quantum-advisor' | 'workflow-optimizer' | 'security-analyst';
  query: string;
  context: any;
  escalationLevel: 'low' | 'medium' | 'high' | 'critical';
  responseFormat: 'text' | 'json' | 'structured';
}

interface MicroAiConfig {
  id: string;
  role: string; // e.g., 'data-quality-sentry', 'script-auditor'
  capabilities: string[]; // e.g., ['observe', 'suggest', 'optimize']
  autonomyLevel: 'observe' | 'suggest' | 'execute';
  constructorEscalation: 'auto' | 'manual' | 'never';
  securityProfile: 'read-only' | 'suggest-only' | 'auto-fix';
  typeSpecificProfile?: any; // For node-type specific data
}

type NodeConfig =
  | InputNodeConfig
  | ProcessNodeConfig
  | OutputNodeConfig
  | QuantumNodeConfig
  | AiNodeConfig
  | ApiNodeConfig
  | SocialNodeConfig
  | LawNodeConfig
  | EvolveNodeConfig
  | InvestNodeConfig
  | AppNodeConfig
  | EmailNodeConfig
  | SheetsNodeConfig
  | SlackNodeConfig
  | DriveNodeConfig
  | WebhookNodeConfig
  | HttpNodeConfig
  | CryptoNodeConfig
  | AssistantNodeConfig;

interface Node {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  inputs: number;
  outputs: number;
  config: NodeConfig;
}

const createDefaultConfig = (type: NodeType): NodeConfig => {
  const microAiEnabled = iotPolicyService.isMicroAiEnabled();

  switch (type) {
    case 'input':
      return { source: 'dataset', autoRefresh: false, microAgents: [], microAiBlueprint: undefined };
    case 'process':
      return { script: 'transform()', retries: 1, microAgents: [], microAiBlueprint: undefined };
    case 'output':
      return { destination: 'dashboard', notifyOnCompletion: true, microAgents: [], microAiBlueprint: undefined };
    case 'quantum':
      return { shots: 1024, useHardware: false, microAgents: [], microAiBlueprint: undefined };
    case 'ai':
      return { model: 'gpt', temperature: 0.2, microAgents: [], microAiBlueprint: undefined };
    case 'api':
      return {
        method: 'GET',
        url: 'https://api.example.com/endpoint',
        headers: {},
        authType: 'none',
        timeout: 30,
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'social':
      return {
        platform: 'facebook',
        action: 'post',
        content: '',
        mediaUrls: [],
        hashtags: [],
        viralOptimization: true,
        microAgents: microAiEnabled
          ? [
              {
                id: 'social-optimizer',
                role: 'Viral Content Optimizer',
                capabilities: ['analyze', 'optimize', 'suggest'],
                autonomyLevel: 'suggest',
                constructorEscalation: 'manual',
                securityProfile: 'suggest-only'
              },
              {
                id: 'hashtag-tracker',
                role: 'Hashtag Performance Tracker',
                capabilities: ['observe', 'analyze'],
                autonomyLevel: 'observe',
                constructorEscalation: 'auto',
                securityProfile: 'read-only'
              }
            ]
          : [],
        microAiBlueprint: microAiEnabled ? 'social_viral_blueprint' : undefined
      };
    case 'law':
      return {
        caseType: 'missing-person',
        priority: 'medium',
        jurisdiction: 'local',
        evidence: [],
        suspects: [],
        timeline: [],
        microAgents: microAiEnabled
          ? [
              {
                id: 'evidence-analyzer',
                role: 'Evidence Pattern Analyzer',
                capabilities: ['analyze', 'correlate'],
                autonomyLevel: 'execute',
                constructorEscalation: 'auto',
                securityProfile: 'read-only'
              },
              {
                id: 'logical-reasoner',
                role: 'Logical Reasoning Engine',
                capabilities: ['reason', 'deduce', 'hypothesize'],
                autonomyLevel: 'suggest',
                constructorEscalation: 'manual',
                securityProfile: 'suggest-only'
              }
            ]
          : [],
        microAiBlueprint: microAiEnabled ? 'law_enforcement_blueprint' : undefined
      };
    case 'evolve':
      return {
        evolutionType: 'performance',
        learningRate: 0.01,
        adaptationThreshold: 0.8,
        feedbackLoop: true,
        historicalData: [],
        microAgents: microAiEnabled
          ? [
              {
                id: 'performance-monitor',
                role: 'Performance Evolution Monitor',
                capabilities: ['monitor', 'analyze', 'optimize'],
                autonomyLevel: 'execute',
                constructorEscalation: 'auto',
                securityProfile: 'auto-fix'
              },
              {
                id: 'adaptation-engine',
                role: 'Workflow Adaptation Engine',
                capabilities: ['learn', 'adapt', 'evolve'],
                autonomyLevel: 'execute',
                constructorEscalation: 'manual',
                securityProfile: 'auto-fix'
              }
            ]
          : [],
        microAiBlueprint: microAiEnabled ? 'self_evolution_blueprint' : undefined
      };
    case 'invest':
      return {
        investmentType: 'stocks',
        strategy: 'moderate',
        riskTolerance: 'medium',
        portfolioSize: 10000,
        autoTrade: false,
        exchanges: ['NYSE', 'NASDAQ'],
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'app':
      return {
        appType: 'web',
        framework: 'react',
        features: ['authentication', 'dashboard'],
        deployment: 'vercel',
        autoDeploy: true,
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'email':
      return {
        provider: 'gmail',
        operation: 'send',
        template: '',
        recipients: [],
        subject: '',
        attachments: [],
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'sheets':
      return {
        operation: 'read',
        spreadsheetId: '',
        sheetName: 'Sheet1',
        range: 'A1:Z100',
        values: [],
        headers: true,
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'slack':
      return {
        operation: 'send',
        channel: '#general',
        message: '',
        attachments: [],
        reactions: [],
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'drive':
      return {
        operation: 'upload',
        fileName: '',
        mimeType: 'application/octet-stream',
        permissions: [],
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'webhook':
      return {
        method: 'POST',
        url: 'https://your-webhook-url.com',
        headers: {},
        payload: {},
        authentication: 'none',
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'http':
      return {
        method: 'GET',
        url: 'https://api.example.com/endpoint',
        headers: {},
        body: {},
        authentication: 'none',
        timeout: 30,
        retries: 3,
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'crypto':
      return {
        exchange: 'binance',
        operation: 'price',
        symbol: 'BTCUSDT',
        amount: 0,
        strategy: 'manual',
        apiKey: '',
        secretKey: '',
        microAgents: [],
        microAiBlueprint: undefined
      };
    case 'assistant':
      return {
        assistantType: 'constructor',
        query: '',
        context: {},
        escalationLevel: 'medium',
        responseFormat: 'text',
        microAgents: [],
        microAiBlueprint: undefined
      };
  }
  throw new Error(`Unknown node type: ${type}`);
};

interface Connection {
  id: string;
  from: string;
  to: string;
  fromPort: number;
  toPort: number;
}

const WorkflowEditor: React.FC = () => {
  const [currentWorkflow, setCurrentWorkflow] = useState<SavedWorkflow | null>(null);
  const [microAiAllowed, setMicroAiAllowed] = useState<boolean>(iotPolicyService.isMicroAiEnabled());
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      type: 'input',
      label: 'Data Input',
      x: 100,
      y: 100,
      inputs: 0,
      outputs: 1,
      config: createDefaultConfig('input')
    },
    {
      id: '2',
      type: 'ai',
      label: 'AI Processor',
      x: 300,
      y: 100,
      inputs: 1,
      outputs: 1,
      config: createDefaultConfig('ai')
    },
    {
      id: '3',
      type: 'quantum',
      label: 'Quantum Optimizer',
      x: 500,
      y: 100,
      inputs: 1,
      outputs: 1,
      config: createDefaultConfig('quantum')
    },
    {
      id: '4',
      type: 'output',
      label: 'Result Output',
      x: 700,
      y: 100,
      inputs: 1,
      outputs: 0,
      config: createDefaultConfig('output')
    }
  ]);

  // Connections managed via workflowService
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 'c1',
      from: '1',
      to: '2',
      fromPort: 0,
      toPort: 0
    },
    {
      id: 'c2',
      from: '2',
      to: '3',
      fromPort: 0,
      toPort: 0
    },
    {
      id: 'c3',
      from: '3',
      to: '4',
      fromPort: 0,
      toPort: 0
    }
  ]);

  // Connection drawing state
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; port: number } | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null);

  const updateNodeConfig = (nodeId: string, updater: (config: NodeConfig) => NodeConfig) => {
    setNodes(nodes.map(node =>
      node.id === nodeId
        ? { ...node, config: updater(node.config) }
        : node
    ));
  };

  const stripMicroAgentsFromNodes = useCallback(() => {
    setNodes(prevNodes =>
      prevNodes.map(node => {
        const config: any = node.config;
        if (config && Array.isArray(config.microAgents) && (config.microAgents.length > 0 || config.microAiBlueprint)) {
          return {
            ...node,
            config: {
              ...config,
              microAgents: [],
              microAiBlueprint: undefined
            }
          };
        }
        return node;
      })
    );
  }, []);

  useEffect(() => {
    const policyHandler = (event: Event) => {
      const detail = (event as CustomEvent<IotPolicyState>).detail;
      const enabled = detail ? detail.micro_ai_enabled !== false : true;
      setMicroAiAllowed(enabled);
      if (!enabled) {
        stripMicroAgentsFromNodes();
      }
    };

    window.addEventListener('iot-policy-updated', policyHandler as EventListener);
    return () => window.removeEventListener('iot-policy-updated', policyHandler as EventListener);
  }, [stripMicroAgentsFromNodes]);

  useEffect(() => {
    if (!microAiAllowed) {
      stripMicroAgentsFromNodes();
    }
  }, [microAiAllowed, stripMicroAgentsFromNodes]);

  useEffect(() => {
    // Load user's workflows
    const loadUserWorkflows = async () => {
      try {
        const response = await persistentWorkflowService.getUserWorkflows();
        if (response.status === 'success' && response.result && response.result.length > 0) {
          setCurrentWorkflow(response.result[0]);
        }
      } catch (error) {
        console.error('Failed to load workflows:', error);
      }
    };

    if (userService.getCurrentUser()) {
      loadUserWorkflows();
    }
  }, []);

  const handleSaveWorkflow = async () => {
    try {
      if (!currentWorkflow) {
        // Create new workflow
        const response = await persistentWorkflowService.saveWorkflow({
          name: 'New Workflow',
          description: 'Custom workflow created in editor',
          category: 'Custom',
          tags: ['custom', 'user-created'],
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: { x: node.x, y: node.y },
            data: {
              label: node.label,
              config: node.config
            }
          })),
          connections: connections.map(conn => ({
            id: conn.id,
            source: conn.from,
            target: conn.to
          }))
        });

        if (response.status === 'success' && response.result) {
          setCurrentWorkflow(response.result);
          alert('Workflow saved successfully!');
        } else {
          alert('Failed to save workflow');
        }
      } else {
        // Update existing workflow
        const response = await persistentWorkflowService.updateWorkflow(currentWorkflow.id, {
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: { x: node.x, y: node.y },
            data: {
              label: node.label,
              config: node.config
            }
          })),
          connections: connections.map(conn => ({
            id: conn.id,
            source: conn.from,
            target: conn.to
          })),
          updatedAt: new Date()
        });

        if (response.status === 'success') {
          alert('Workflow updated successfully!');
        } else {
          alert('Failed to update workflow');
        }
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow: ' + (error as Error).message);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow) {
      alert('Please save workflow first');
      return;
    }

    try {
      const execution = await persistentWorkflowService.executeWorkflow(currentWorkflow.id);
      if (execution.status === 'success') {
        alert(`Workflow executed successfully!\nResult: ${JSON.stringify(execution.result, null, 2)}`);
      } else {
        alert(`Workflow execution failed: ${execution.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Error executing workflow: ' + (error as Error).message);
    }
  };

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) || null : null;

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    setDragging(nodeId);
    setDragOffset({
      x: canvasX - node.x,
      y: canvasY - node.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      const newNodes = nodes.map(node => {
        if (node.id === dragging) {
          return {
            ...node,
            x: canvasX - dragOffset.x,
            y: canvasY - dragOffset.y
          };
        }
        return node;
      });
      setNodes(newNodes);
    } else if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setTempConnection({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setConnectingFrom(null);
    setTempConnection(null);
  };

  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, port: number, isOutput: boolean) => {
    e.stopPropagation();
    if (isOutput) {
      setConnectingFrom({ nodeId, port });
    }
  };

  const handlePortMouseUp = (e: React.MouseEvent, nodeId: string, port: number, isInput: boolean) => {
    e.stopPropagation();
    if (connectingFrom && isInput && connectingFrom.nodeId !== nodeId) {
      // Create new connection
      const newConnection: Connection = {
        id: `c${Date.now()}`,
        from: connectingFrom.nodeId,
        to: nodeId,
        fromPort: connectingFrom.port,
        toPort: port
      };
      setConnections([...connections, newConnection]);
    }
    setConnectingFrom(null);
    setTempConnection(null);
  };

  const addNode = (type: NodeType) => {
    let inputs = 1;
    let outputs = 1;

    switch (type) {
      case 'input':
        inputs = 0;
        outputs = 1;
        break;
      case 'output':
        inputs = 1;
        outputs = 0;
        break;
      case 'api':
        inputs = 1;
        outputs = 1;
        break;
      case 'social':
        inputs = 1;
        outputs = 0; // Social posts are terminal
        break;
      case 'law':
        inputs = 1;
        outputs = 1;
        break;
      case 'evolve':
        inputs = 1;
        outputs = 1;
        break;
      default:
        inputs = 1;
        outputs = 1;
    }

    const newNode: Node = {
      id: Date.now().toString(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      inputs,
      outputs,
      config: createDefaultConfig(type)
    };

    setNodes([...nodes, newNode]);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'input': return '#00d4ff';
      case 'ai': return '#ffa500';
      case 'quantum': return '#ff00ff';
      case 'output': return '#00ff00';
      case 'process': return '#666666';
      case 'api': return '#ff6b6b';
      case 'social': return '#4ecdc4';
      case 'law': return '#45b7d1';
      case 'evolve': return '#f9ca24';
      case 'invest': return '#2ecc71';
      case 'app': return '#9b59b6';
      case 'email': return '#e74c3c';
      case 'sheets': return '#27ae60';
      case 'slack': return '#8e44ad';
      case 'drive': return '#3498db';
      case 'webhook': return '#f39c12';
      case 'http': return '#d35400';
      case 'crypto': return '#f1c40f';
      case 'assistant': return '#1abc9c';
      default: return '#666666';
    }
  };

  const renderMicroAiFields = () => {
    if (!selectedNodeData) return null;

    const config = selectedNodeData.config;

    return (
      <div>
        <div className="property-group">
          <label>Micro AI Blueprint</label>
          <input
            type="text"
            placeholder="e.g., qkd_micro_seed"
            value={config.microAiBlueprint || ''}
            onChange={(e) => updateNodeConfig(selectedNodeData.id, cfg => ({
              ...cfg,
              microAiBlueprint: e.target.value || undefined
            }))}
          />
          <button
            className="small-btn"
            onClick={() => {
              // TODO: Call backend to generate agents via blueprint
              alert('Generate agents via quantum blueprint - backend integration needed');
            }}
          >
            Generate
          </button>
        </div>
        <div className="micro-agents-list">
          {config.microAgents.map((agent, index) => (
            <div key={agent.id} className="micro-agent-item">
              <div className="agent-header">
                <span>{agent.role}</span>
                <button
                  className="remove-btn"
                  onClick={() => updateNodeConfig(selectedNodeData.id, cfg => ({
                    ...cfg,
                    microAgents: cfg.microAgents.filter((_, i) => i !== index)
                  }))}
                >
                  ✕
                </button>
              </div>
              <div className="agent-details">
                <div className="property-group">
                  <label>Autonomy</label>
                  <select
                    value={agent.autonomyLevel}
                    onChange={(e) => updateNodeConfig(selectedNodeData.id, cfg => ({
                      ...cfg,
                      microAgents: cfg.microAgents.map((a, i) =>
                        i === index ? { ...a, autonomyLevel: e.target.value as typeof a.autonomyLevel } : a
                      )
                    }))}
                  >
                    <option value="observe">Observe</option>
                    <option value="suggest">Suggest</option>
                    <option value="execute">Execute</option>
                  </select>
                </div>
                <div className="property-group">
                  <label>Escalation</label>
                  <select
                    value={agent.constructorEscalation}
                    onChange={(e) => updateNodeConfig(selectedNodeData.id, cfg => ({
                      ...cfg,
                      microAgents: cfg.microAgents.map((a, i) =>
                        i === index ? { ...a, constructorEscalation: e.target.value as typeof a.constructorEscalation } : a
                      )
                    }))}
                  >
                    <option value="auto">Auto</option>
                    <option value="manual">Manual</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button
            className="add-agent-btn"
            onClick={() => updateNodeConfig(selectedNodeData.id, cfg => ({
              ...cfg,
              microAgents: [...cfg.microAgents, {
                id: `agent-${Date.now()}`,
                role: 'New Agent',
                capabilities: ['observe'],
                autonomyLevel: 'observe',
                constructorEscalation: 'manual',
                securityProfile: 'read-only'
              }]
            }))}
          >
            + Add Micro Agent
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="workflow-editor">
      {!microAiAllowed && (
        <div className="iot-policy-banner">
          Micro AI agents are disabled for IoT deployments. Existing nodes have been sanitized to operate without embedded micro AIs.
        </div>
      )}
      <div className="editor-header">
        <h1>Workflow Editor</h1>
        <p>Drag and drop to create quantum workflows</p>
        {currentWorkflow && (
          <span className="workflow-name">Editing: {currentWorkflow.name}</span>
        )}
      </div>

      <div className="editor-toolbar">
        <button className="toolbar-btn" onClick={() => addNode('input')}>
          <span className="btn-icon">📥</span>
          Add Input
        </button>
        <button className="toolbar-btn" onClick={() => addNode('ai')}>
          <span className="btn-icon">🤖</span>
          Add AI
        </button>
        <button className="toolbar-btn" onClick={() => addNode('quantum')}>
          <span className="btn-icon">⚛️</span>
          Add Quantum
        </button>
        <button className="toolbar-btn" onClick={() => addNode('output')}>
          <span className="btn-icon">📤</span>
          Add Output
        </button>
        <button className="toolbar-btn" onClick={() => addNode('api')}>
          <span className="btn-icon">🔗</span>
          Add API
        </button>
        <button className="toolbar-btn" onClick={() => addNode('social')}>
          <span className="btn-icon">📱</span>
          Add Social
        </button>
        <button className="toolbar-btn" onClick={() => addNode('law')}>
          <span className="btn-icon">⚖️</span>
          Add Law
        </button>
        <button className="toolbar-btn" onClick={() => addNode('evolve')}>
          <span className="btn-icon">🧬</span>
          Add Evolve
        </button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-btn" onClick={() => addNode('invest')}>
          <span className="btn-icon">📈</span>
          Add Invest
        </button>
        <button className="toolbar-btn" onClick={() => addNode('crypto')}>
          <span className="btn-icon">₿</span>
          Add Crypto
        </button>
        <button className="toolbar-btn" onClick={() => addNode('app')}>
          <span className="btn-icon">📱</span>
          Add App
        </button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-btn" onClick={() => addNode('email')}>
          <span className="btn-icon">✉️</span>
          Add Email
        </button>
        <button className="toolbar-btn" onClick={() => addNode('sheets')}>
          <span className="btn-icon">📊</span>
          Add Sheets
        </button>
        <button className="toolbar-btn" onClick={() => addNode('slack')}>
          <span className="btn-icon">💬</span>
          Add Slack
        </button>
        <button className="toolbar-btn" onClick={() => addNode('drive')}>
          <span className="btn-icon">☁️</span>
          Add Drive
        </button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-btn" onClick={() => addNode('webhook')}>
          <span className="btn-icon">🪝</span>
          Add Webhook
        </button>
        <button className="toolbar-btn" onClick={() => addNode('http')}>
          <span className="btn-icon">🌐</span>
          Add HTTP
        </button>
        <button className="toolbar-btn" onClick={() => addNode('assistant')}>
          <span className="btn-icon">🤖</span>
          Add Assistant
        </button>
        <div className="toolbar-separator"></div>
        <button
          className="toolbar-btn help"
          onClick={() => {
            // Trigger Constructor help for workflow creation
            const constructorEvent = new CustomEvent('constructor-help', {
              detail: { context: 'workflow-editor', action: 'help-create-workflow' }
            });
            window.dispatchEvent(constructorEvent);
          }}
          title="Get help from Constructor AI"
        >
          <span className="btn-icon">🧠</span>
          Ask Constructor
        </button>
        <button className="toolbar-btn primary" onClick={handleExecuteWorkflow}>
          <span className="btn-icon">▶️</span>
          Run Workflow
        </button>
        <button className="toolbar-btn secondary" onClick={handleSaveWorkflow}>
          <span className="btn-icon">💾</span>
          Save
        </button>
      </div>

      <div
        className="editor-canvas"
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg className="connections-layer">
          {connections.map(connection => {
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);

            if (!fromNode || !toNode) return null;

            const fromX = fromNode.x + 150;
            const fromY = fromNode.y + 40 + (connection.fromPort * 20);
            const toX = toNode.x;
            const toY = toNode.y + 40 + (connection.toPort * 20);

            return (
              <path
                key={connection.id}
                d={`M ${fromX} ${fromY} C ${fromX + 50} ${fromY} ${toX - 50} ${toY} ${toX} ${toY}`}
                stroke="#00d4ff"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  // Remove connection on click
                  setConnections(connections.filter(c => c.id !== connection.id));
                }}
              />
            );
          })}

          {/* Temporary connection while dragging */}
          {connectingFrom && tempConnection && (() => {
            const fromNode = nodes.find(n => n.id === connectingFrom.nodeId);
            if (!fromNode) return null;

            const fromX = fromNode.x + 150;
            const fromY = fromNode.y + 40 + (connectingFrom.port * 20);

            return (
              <path
                d={`M ${fromX} ${fromY} C ${fromX + 50} ${fromY} ${tempConnection.x - 50} ${tempConnection.y} ${tempConnection.x} ${tempConnection.y}`}
                stroke="#00d4ff"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            );
          })()}

          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#00d4ff"
              />
            </marker>
          </defs>
        </svg>

        {nodes.map(node => (
          <div
            key={node.id}
            className={`workflow-node ${node.type} ${selectedNode === node.id ? 'selected' : ''}`}
            style={{
              left: node.x,
              top: node.y,
              borderColor: getNodeColor(node.type)
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={() => setSelectedNode(node.id)}
          >
            <div className="node-header">
              <span className="node-icon">
                {node.type === 'input' ? '📥' : node.type === 'process' ? '⚙️' : '📤'}
              </span>
              <span className="node-label">{node.label}</span>
            </div>

            <div className="node-ports">
              {Array.from({ length: node.inputs }).map((_, i) => (
                <div
                  key={`input-${i}`}
                  className="port input-port"
                  onMouseUp={(e) => handlePortMouseUp(e, node.id, i, true)}
                  title="Drop connection here"
                ></div>
              ))}
              {Array.from({ length: node.outputs }).map((_, i) => (
                <div
                  key={`output-${i}`}
                  className="port output-port"
                  onMouseDown={(e) => handlePortMouseDown(e, node.id, i, true)}
                  title="Drag to create connection"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="editor-properties">
        <h3>Properties</h3>
        {selectedNodeData ? (
          <div className="properties-content">
            <div className="property-group">
              <label>Node ID</label>
              <input type="text" value={selectedNodeData.id} readOnly />
            </div>
            <div className="property-group">
              <label>Label</label>
              <input
                type="text"
                value={selectedNodeData.label}
                onChange={(e) => {
                  setNodes(nodes.map(n =>
                    n.id === selectedNodeData.id
                      ? { ...n, label: e.target.value }
                      : n
                  ));
                }}
              />
            </div>
            <div className="property-group">
              <label>Type</label>
              <select
                value={selectedNodeData.type}
                onChange={(e) => {
                  const newType = e.target.value as NodeType;
                  let inputs = 1;
                  let outputs = 1;

                  switch (newType) {
                    case 'input':
                      inputs = 0;
                      outputs = 1;
                      break;
                    case 'output':
                      inputs = 1;
                      outputs = 0;
                      break;
                    case 'api':
                    case 'social':
                    case 'email':
                    case 'slack':
                    case 'webhook':
                      inputs = 1;
                      outputs = 0;
                      break;
                    case 'invest':
                    case 'crypto':
                    case 'app':
                    case 'sheets':
                    case 'drive':
                    case 'http':
                    case 'assistant':
                      inputs = 1;
                      outputs = 1;
                      break;
                  }

                  setNodes(nodes.map(n =>
                    n.id === selectedNodeData.id
                      ? {
                          ...n,
                          type: newType,
                          inputs,
                          outputs,
                          config: createDefaultConfig(newType)
                        }
                      : n
                  ));
                }}
              >
                <option value="input">Input</option>
                <option value="process">Process</option>
                <option value="ai">AI</option>
                <option value="quantum">Quantum</option>
                <option value="output">Output</option>
                <option value="api">API</option>
                <option value="social">Social Media</option>
                <option value="law">Law Enforcement</option>
                <option value="evolve">Self-Evolving</option>
                <option value="invest">Investment</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="app">App Creation</option>
                <option value="email">Email</option>
                <option value="sheets">Google Sheets</option>
                <option value="slack">Slack</option>
                <option value="drive">Google Drive</option>
                <option value="webhook">Webhook</option>
                <option value="http">HTTP Request</option>
                <option value="assistant">AI Assistant</option>
              </select>
            </div>
            <div className="property-divider">Configuration</div>
            {/* {renderConfigFields()} */}
            <div className="property-divider">Micro AI</div>
            {renderMicroAiFields()}
          </div>
        ) : (
          <p className="no-selection">Select a node to edit properties</p>
        )}
      </div>
    </div>
  );
};

export default WorkflowEditor;