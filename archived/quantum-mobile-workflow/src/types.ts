// src/types.ts

/** Evolution policy controlling how a workflow evolves. */
export interface EvolutionPolicy {
  enabled: boolean;
  maxVariants: number;
  /** Primary KPI to optimize. */
  kpiPrimary: 'revenue' | 'conversion' | 'throughput' | 'latency';
  constraints: {
    mustUseQubeSecurity: boolean;
    maxLatencyMs?: number;
    forbiddenIntegrations?: string[];
  };
}

/** A specific version of a workflow with metrics. */
export interface WorkflowVersion {
  id: string;
  parentVersionId?: string;
  label: string;          // e.g. "v3 – Titan optimized routing"
  aeonmiSource: string;
  createdAt: string;
  metricsSnapshot?: {
    runs: number;
    revenueUsd: number;
    successRate: number;
    avgLatencyMs: number;
  };
}

/** Node types supported by the canvas. */
export type NodeType =
  | 'TRIGGER_HTTP'
  | 'TRIGGER_SCHEDULE'
  | 'ACTION_HTTP'
  | 'ACTION_DB'
  | 'ACTION_EMAIL'
  | 'LOGIC_CONDITION'
  | 'LOGIC_SWITCH'
  | 'AI_AGENT'
  | 'QUBE_KEY'
  | 'QUBE_COMPUTE'
  | 'TITAN_OPTIMIZER'
  | 'META_EVOLVER'
  | 'UTIL_TRANSFORM';

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  // Arbitrary config including Aeonmi snippets and micro‑agent settings.
  config?: Record<string, any>;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

/** Top‑level workflow entity with evolution support. */
export interface Workflow {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused';
  nodes: Node[];
  edges: Edge[];
  currentVersionId: string;
  versions: WorkflowVersion[];
  evolutionPolicy?: EvolutionPolicy;
  createdAt: string;
  updatedAt: string;
}

/** Micro agent configuration used by AI or quantum nodes. */
export interface MicroAgentConfig {
  systemPrompt: string;
  temperature: number;
  provider: string;
  [key: string]: any;
}