import { InitializationPayload } from '../state/types';
import { RunHistoryItem, Workflow } from '../types';
import { scriptTemplates } from './templates';

const now = () => new Date().toISOString();

const workflowEbook: Workflow = {
  id: 'wf-ebook',
  ownerId: 'owner-1',
  name: 'Ebook Quantum Publish (BB84)',
  description: 'Publishes quantum-encrypted ebooks with BB84 key schedule.',
  status: 'active',
  nodes: [
    {
      id: 'node-trigger-http',
      type: 'TRIGGER_HTTP',
      title: 'Incoming Order',
      x: 40,
      y: 160,
      ports: [{ id: 'trigger-out', direction: 'out', label: 'payload' }],
      badges: ['QuantumSecured'],
    },
    {
      id: 'node-qube-key',
      type: 'QUBE_KEY',
      title: 'QUBE Key Exchange',
      x: 220,
      y: 160,
      ports: [
        { id: 'qube-key-in', direction: 'in' },
        { id: 'qube-key-out', direction: 'out', label: 'key' },
      ],
      badges: ['QuantumSecured'],
      config: { basis: 'bb84', retries: 3 },
    },
    {
      id: 'node-qube-compute',
      type: 'QUBE_COMPUTE',
      title: 'QUBE Compute Cluster',
      x: 420,
      y: 140,
      ports: [
        { id: 'compute-in', direction: 'in' },
        { id: 'compute-out', direction: 'out' },
      ],
      badges: ['QuantumSecured'],
      config: { program: 'phase-kickback-optimizer' },
    },
    {
      id: 'node-action-http',
      type: 'ACTION_HTTP',
      title: 'Deliver Ebook',
      x: 620,
      y: 180,
      ports: [
        { id: 'action-in', direction: 'in' },
        { id: 'action-out', direction: 'out' },
      ],
      config: { endpoint: 'https://api.quantumforge.dev/ebook' },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      from: { nodeId: 'node-trigger-http', portId: 'trigger-out' },
      to: { nodeId: 'node-qube-key', portId: 'qube-key-in' },
    },
    {
      id: 'edge-2',
      from: { nodeId: 'node-qube-key', portId: 'qube-key-out' },
      to: { nodeId: 'node-qube-compute', portId: 'compute-in' },
    },
    {
      id: 'edge-3',
      from: { nodeId: 'node-qube-compute', portId: 'compute-out' },
      to: { nodeId: 'node-action-http', portId: 'action-in' },
    },
  ],
  currentVersionId: 'ver-ebook-live',
  versions: [
    {
      id: 'ver-ebook-live',
      label: 'Live v1',
      parentVersionId: undefined,
      createdAt: now(),
      aeonmiSource: 'workflow ebook v1',
      status: 'live',
      metricsSnapshot: {
        runs: 128,
        revenueUsd: 45230,
        successRate: 0.97,
        avgLatencyMs: 210,
        qber: 0.012,
      },
    },
  ],
  evolutionPolicy: {
    enabled: false,
    maxVariants: 3,
    kpiPrimary: 'revenue',
    constraints: {
      mustUseQubeSecurity: true,
      maxLatencyMs: 400,
    },
  },
  createdAt: now(),
  updatedAt: now(),
};

const workflowCheckout: Workflow = {
  id: 'wf-checkout',
  ownerId: 'owner-1',
  name: 'Checkout Optimizer',
  description: 'Meta-evolving checkout orchestration with Titan guidance.',
  status: 'draft',
  nodes: [
    {
      id: 'node-trigger-schedule',
      type: 'TRIGGER_SCHEDULE',
      title: 'Hourly Batch Trigger',
      x: 30,
      y: 80,
      ports: [{ id: 'schedule-out', direction: 'out' }],
    },
    {
      id: 'node-logic-switch',
      type: 'LOGIC_SWITCH',
      title: 'Route by Segment',
      x: 180,
      y: 60,
      ports: [
        { id: 'switch-in', direction: 'in' },
        { id: 'switch-pro', direction: 'out', label: 'Pro' },
        { id: 'switch-standard', direction: 'out', label: 'Standard' },
      ],
    },
    {
      id: 'node-ai-agent',
      type: 'AI_AGENT',
      title: 'Cart Recovery Agent',
      x: 360,
      y: 20,
      ports: [
        { id: 'agent-in', direction: 'in' },
        { id: 'agent-out', direction: 'out' },
      ],
      badges: ['Experimental'],
    },
    {
      id: 'node-meta-evolver',
      type: 'META_EVOLVER',
      title: 'Meta Evolver',
      x: 340,
      y: 150,
      ports: [
        { id: 'meta-in', direction: 'in' },
        { id: 'meta-out', direction: 'out' },
      ],
      badges: ['Experimental'],
      config: { variants: 2 },
    },
    {
      id: 'node-titan-optimizer',
      type: 'TITAN_OPTIMIZER',
      title: 'Titan Optimizer',
      x: 520,
      y: 120,
      ports: [
        { id: 'titan-in', direction: 'in' },
        { id: 'titan-out', direction: 'out' },
      ],
      badges: ['Experimental'],
      config: { focus: 'conversion' },
    },
  ],
  edges: [
    {
      id: 'edge-4',
      from: { nodeId: 'node-trigger-schedule', portId: 'schedule-out' },
      to: { nodeId: 'node-logic-switch', portId: 'switch-in' },
    },
    {
      id: 'edge-5',
      from: { nodeId: 'node-logic-switch', portId: 'switch-pro' },
      to: { nodeId: 'node-ai-agent', portId: 'agent-in' },
    },
    {
      id: 'edge-6',
      from: { nodeId: 'node-logic-switch', portId: 'switch-standard' },
      to: { nodeId: 'node-meta-evolver', portId: 'meta-in' },
    },
    {
      id: 'edge-7',
      from: { nodeId: 'node-meta-evolver', portId: 'meta-out' },
      to: { nodeId: 'node-titan-optimizer', portId: 'titan-in' },
    },
    {
      id: 'edge-8',
      from: { nodeId: 'node-ai-agent', portId: 'agent-out' },
      to: { nodeId: 'node-titan-optimizer', portId: 'titan-in' },
    },
  ],
  currentVersionId: 'ver-checkout-exp',
  versions: [
    {
      id: 'ver-checkout-exp',
      label: 'Experiment Alpha',
      createdAt: now(),
      status: 'experimental',
      aeonmiSource: 'workflow checkout alpha',
      metricsSnapshot: {
        runs: 32,
        revenueUsd: 15200,
        successRate: 0.78,
        avgLatencyMs: 320,
      },
    },
  ],
  evolutionPolicy: {
    enabled: true,
    maxVariants: 5,
    kpiPrimary: 'conversion',
    constraints: {
      mustUseQubeSecurity: false,
      maxLatencyMs: 500,
      forbiddenIntegrations: ['legacy-crm'],
    },
  },
  createdAt: now(),
  updatedAt: now(),
};

const workflowGrover: Workflow = {
  id: 'wf-grover',
  ownerId: 'owner-1',
  name: 'Grover Search Agent',
  description: 'Quantum search algorithm configured by Micro AI.',
  status: 'active',
  nodes: [
    {
      id: 'node-grover-trigger',
      type: 'TRIGGER_HTTP',
      title: 'Search Request',
      x: 50,
      y: 100,
      ports: [{ id: 'in', direction: 'out', label: 'query' }],
    },
    {
      id: 'node-grover-ai',
      type: 'AI_AGENT',
      title: 'Search Configurator',
      x: 250,
      y: 100,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
      config: { model: 'gpt-4-turbo', temperature: 0.2 },
    },
    {
      id: 'node-grover-compute',
      type: 'QUBE_COMPUTE',
      title: 'Grover Algorithm',
      x: 450,
      y: 100,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
      badges: ['QuantumSecured'],
      config: { program: 'grover-search', qubits: 5 },
    },
    {
      id: 'node-grover-result',
      type: 'ACTION_HTTP',
      title: 'Return Result',
      x: 650,
      y: 100,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
    },
  ],
  edges: [
    {
      id: 'e1',
      from: { nodeId: 'node-grover-trigger', portId: 'in' },
      to: { nodeId: 'node-grover-ai', portId: 'in' },
    },
    {
      id: 'e2',
      from: { nodeId: 'node-grover-ai', portId: 'out' },
      to: { nodeId: 'node-grover-compute', portId: 'in' },
    },
    {
      id: 'e3',
      from: { nodeId: 'node-grover-compute', portId: 'out' },
      to: { nodeId: 'node-grover-result', portId: 'in' },
    },
  ],
  currentVersionId: 'v1',
  versions: [
    {
      id: 'v1',
      label: 'v1',
      createdAt: now(),
      status: 'live',
      aeonmiSource: '',
      metricsSnapshot: { runs: 0, revenueUsd: 0, successRate: 0, avgLatencyMs: 0 },
    },
  ],
  evolutionPolicy: {
    enabled: false,
    maxVariants: 3,
    kpiPrimary: 'latency',
    constraints: { mustUseQubeSecurity: false },
  },
  createdAt: now(),
  updatedAt: now(),
};

const workflowTeleport: Workflow = {
  id: 'wf-teleport',
  ownerId: 'owner-1',
  name: 'Qubit Teleportation',
  description: 'Standard quantum teleportation protocol.',
  status: 'draft',
  nodes: [
    {
      id: 'node-tele-gen',
      type: 'QUBE_KEY',
      title: 'Entanglement Gen',
      x: 50,
      y: 150,
      ports: [{ id: 'out', direction: 'out' }],
      badges: ['QuantumSecured'],
    },
    {
      id: 'node-tele-bell',
      type: 'QUBE_COMPUTE',
      title: 'Bell Measurement',
      x: 250,
      y: 150,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
      badges: ['QuantumSecured'],
    },
    {
      id: 'node-tele-class',
      type: 'ACTION_HTTP',
      title: 'Classical Channel',
      x: 450,
      y: 150,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
    },
    {
      id: 'node-tele-correct',
      type: 'QUBE_COMPUTE',
      title: 'State Correction',
      x: 650,
      y: 150,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
      badges: ['QuantumSecured'],
    },
  ],
  edges: [
    {
      id: 'e1',
      from: { nodeId: 'node-tele-gen', portId: 'out' },
      to: { nodeId: 'node-tele-bell', portId: 'in' },
    },
    {
      id: 'e2',
      from: { nodeId: 'node-tele-bell', portId: 'out' },
      to: { nodeId: 'node-tele-class', portId: 'in' },
    },
    {
      id: 'e3',
      from: { nodeId: 'node-tele-class', portId: 'out' },
      to: { nodeId: 'node-tele-correct', portId: 'in' },
    },
  ],
  currentVersionId: 'v1',
  versions: [
    {
      id: 'v1',
      label: 'v1',
      createdAt: now(),
      status: 'live',
      aeonmiSource: '',
      metricsSnapshot: { runs: 0, revenueUsd: 0, successRate: 0, avgLatencyMs: 0 },
    },
  ],
  evolutionPolicy: {
    enabled: false,
    maxVariants: 3,
    kpiPrimary: 'latency',
    constraints: { mustUseQubeSecurity: false },
  },
  createdAt: now(),
  updatedAt: now(),
};

const workflowDataClean: Workflow = {
  id: 'wf-dataclean',
  ownerId: 'owner-1',
  name: 'Data Cleaning Agent',
  description: 'Hybrid classical/quantum data preprocessing.',
  status: 'active',
  nodes: [
    {
      id: 'node-clean-in',
      type: 'TRIGGER_HTTP',
      title: 'Data Ingest',
      x: 50,
      y: 100,
      ports: [{ id: 'out', direction: 'out' }],
    },
    {
      id: 'node-clean-ai',
      type: 'AI_AGENT',
      title: 'Anomaly Detector',
      x: 250,
      y: 100,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
      config: { model: 'gpt-4-turbo' },
    },
    {
      id: 'node-clean-svm',
      type: 'QUBE_COMPUTE',
      title: 'Quantum SVM',
      x: 450,
      y: 100,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
      badges: ['QuantumSecured'],
    },
    {
      id: 'node-clean-save',
      type: 'ACTION_HTTP',
      title: 'Save Clean Data',
      x: 650,
      y: 100,
      ports: [{ id: 'in', direction: 'in' }],
    },
  ],
  edges: [
    {
      id: 'e1',
      from: { nodeId: 'node-clean-in', portId: 'out' },
      to: { nodeId: 'node-clean-ai', portId: 'in' },
    },
    {
      id: 'e2',
      from: { nodeId: 'node-clean-ai', portId: 'out' },
      to: { nodeId: 'node-clean-svm', portId: 'in' },
    },
    {
      id: 'e3',
      from: { nodeId: 'node-clean-svm', portId: 'out' },
      to: { nodeId: 'node-clean-save', portId: 'in' },
    },
  ],
  currentVersionId: 'v1',
  versions: [
    {
      id: 'v1',
      label: 'v1',
      createdAt: now(),
      status: 'live',
      aeonmiSource: '',
      metricsSnapshot: { runs: 0, revenueUsd: 0, successRate: 0, avgLatencyMs: 0 },
    },
  ],
  evolutionPolicy: {
    enabled: true,
    maxVariants: 5,
    kpiPrimary: 'throughput',
    constraints: { mustUseQubeSecurity: false },
  },
  createdAt: now(),
  updatedAt: now(),
};

const workflowLocalLLM: Workflow = {
  id: 'wf-local-llm',
  ownerId: 'owner-1',
  name: 'Local LLM Privacy Agent',
  description: 'Processes sensitive data using a local transformer model.',
  status: 'active',
  nodes: [
    {
      id: 'node-llm-in',
      type: 'TRIGGER_HTTP',
      title: 'Sensitive Input',
      x: 50,
      y: 100,
      ports: [{ id: 'out', direction: 'out' }],
    },
    {
      id: 'node-llm-local',
      type: 'LOCAL_LLM',
      title: 'Llama 3 (Local)',
      x: 250,
      y: 100,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
      config: { modelPath: 'C:/models/llama-3-8b.gguf', contextWindow: 4096 },
    },
    {
      id: 'node-llm-save',
      type: 'ACTION_DB',
      title: 'Secure Storage',
      x: 450,
      y: 100,
      ports: [{ id: 'in', direction: 'in' }],
    },
  ],
  edges: [
    {
      id: 'e1',
      from: { nodeId: 'node-llm-in', portId: 'out' },
      to: { nodeId: 'node-llm-local', portId: 'in' },
    },
    {
      id: 'e2',
      from: { nodeId: 'node-llm-local', portId: 'out' },
      to: { nodeId: 'node-llm-save', portId: 'in' },
    },
  ],
  currentVersionId: 'v1',
  versions: [
    {
      id: 'v1',
      label: 'v1',
      createdAt: now(),
      status: 'live',
      aeonmiSource: '',
      metricsSnapshot: { runs: 0, revenueUsd: 0, successRate: 0, avgLatencyMs: 0 },
    },
  ],
  evolutionPolicy: {
    enabled: false,
    maxVariants: 0,
    kpiPrimary: 'latency',
    constraints: { mustUseQubeSecurity: false },
  },
  createdAt: now(),
  updatedAt: now(),
};

const workflowQEC: Workflow = {
  id: 'wf-qec',
  ownerId: 'owner-1',
  name: 'Quantum Error Correction',
  description: 'Demonstrates error mitigation using surface codes.',
  status: 'active',
  nodes: [
    {
      id: 'node-qec-in',
      type: 'TRIGGER_HTTP',
      title: 'Noisy Input',
      x: 50,
      y: 100,
      ports: [{ id: 'out', direction: 'out' }],
    },
    {
      id: 'node-qec-compute',
      type: 'QUBE_COMPUTE',
      title: 'Logical Qubit Ops',
      x: 250,
      y: 100,
      ports: [
        { id: 'in', direction: 'in' },
        { id: 'out', direction: 'out' },
      ],
      badges: ['QuantumSecured'],
      config: {
        program: 'surface-code-d3',
        qubits: 17,
        errorMitigation: {
          method: 'richardson-extrapolation',
          shots: 10000,
          level: 'aggressive',
        },
      },
    },
    {
      id: 'node-qec-out',
      type: 'ACTION_HTTP',
      title: 'Corrected Result',
      x: 450,
      y: 100,
      ports: [{ id: 'in', direction: 'in' }],
    },
  ],
  edges: [
    {
      id: 'e1',
      from: { nodeId: 'node-qec-in', portId: 'out' },
      to: { nodeId: 'node-qec-compute', portId: 'in' },
    },
    {
      id: 'e2',
      from: { nodeId: 'node-qec-compute', portId: 'out' },
      to: { nodeId: 'node-qec-out', portId: 'in' },
    },
  ],
  currentVersionId: 'v1',
  versions: [
    {
      id: 'v1',
      label: 'v1',
      createdAt: now(),
      status: 'live',
      aeonmiSource: '',
      metricsSnapshot: { runs: 0, revenueUsd: 0, successRate: 0, avgLatencyMs: 0 },
    },
  ],
  evolutionPolicy: {
    enabled: false,
    maxVariants: 0,
    kpiPrimary: 'latency',
    constraints: { mustUseQubeSecurity: true },
  },
  createdAt: now(),
  updatedAt: now(),
};

const runHistorySeed: RunHistoryItem[] = [
  {
    id: 'run-1',
    workflowId: 'wf-ebook',
    versionId: 'ver-ebook-live',
    executedAt: now(),
    result: 'success',
    latencyMs: 215,
    revenueUsdDelta: 420,
    kpiSnapshot: {
      revenue: 420,
      conversion: 0.82,
      throughput: 38,
      latency: 0.21,
      qber: 0.012,
    },
  },
  {
    id: 'run-2',
    workflowId: 'wf-checkout',
    versionId: 'ver-checkout-exp',
    executedAt: now(),
    result: 'partial',
    latencyMs: 310,
    revenueUsdDelta: 180,
    kpiSnapshot: {
      revenue: 180,
      conversion: 0.67,
      throughput: 26,
      latency: 0.31,
    },
  },
];

export const seedWorkflows = (): InitializationPayload => ({
  workflows: [
    workflowEbook,
    workflowCheckout,
    workflowGrover,
    workflowTeleport,
    workflowDataClean,
    workflowLocalLLM,
    workflowQEC,
  ],
  runs: runHistorySeed,
  templates: scriptTemplates,
});
