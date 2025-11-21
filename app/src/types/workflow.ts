export type KPIKey = 'revenue' | 'conversion' | 'throughput' | 'latency' | 'qber';

export type EvolutionPolicy = {
  enabled: boolean;
  maxVariants: number;
  kpiPrimary: Exclude<KPIKey, 'qber'>;
  constraints: {
    mustUseQubeSecurity: boolean;
    maxLatencyMs?: number;
    forbiddenIntegrations?: string[];
  };
};

export type MicroAIConfig = {
  model: 'gpt-4' | 'claude-3' | 'llama-3' | 'aeonmi-micro-v1';
  temperature: number;
  systemPrompt?: string;
  capabilities: ('code' | 'search' | 'vision')[];
  costLimitUsd?: number;
};

export type WorkflowVersionStatus = 'live' | 'experimental' | 'archived';

export type WorkflowVersion = {
  id: string;
  parentVersionId?: string;
  label: string;
  aeonmiSource: string;
  createdAt: string;
  metricsSnapshot?: {
    runs: number;
    revenueUsd: number;
    successRate: number;
    avgLatencyMs: number;
    qber?: number;
  };
  status?: WorkflowVersionStatus;
};

export type NodeType =
  | 'TRIGGER_HTTP'
  | 'TRIGGER_SCHEDULE'
  | 'ACTION_HTTP'
  | 'ACTION_DB'
  | 'ACTION_EMAIL'
  | 'LOGIC_CONDITION'
  | 'LOGIC_SWITCH'
  | 'AI_AGENT'
  | 'LOCAL_LLM'
  | 'QUBE_KEY'
  | 'QUBE_COMPUTE'
  | 'TITAN_OPTIMIZER'
  | 'META_EVOLVER'
  | 'UTIL_TRANSFORM';

export type Port = { id: string; label?: string; direction: 'in' | 'out' };

export type Node = {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  ports: Port[];
  config?: Record<string, unknown>;
  microAIConfig?: MicroAIConfig;
  badges?: ('QuantumSecured' | 'Experimental')[];
};

export type Edge = {
  id: string;
  from: { nodeId: string; portId: string };
  to: { nodeId: string; portId: string };
  label?: string;
};

export type WorkflowStatus = 'draft' | 'active' | 'paused';

export type Workflow = {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  nodes: Node[];
  edges: Edge[];
  currentVersionId: string;
  versions: WorkflowVersion[];
  evolutionPolicy?: EvolutionPolicy;
  createdAt: string;
  updatedAt: string;
};

export type RunHistoryItem = {
  id: string;
  workflowId: string;
  versionId: string;
  executedAt: string;
  result: 'success' | 'error' | 'partial';
  latencyMs: number;
  revenueUsdDelta: number;
  kpiSnapshot: {
    revenue: number;
    conversion: number;
    throughput: number;
    latency: number;
    qber?: number;
  };
};
