import { Workflow, WorkflowVersion } from '../types';

const pseudoRandom = (seed: string, range = 1): number => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    const char = seed.charCodeAt(index);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const normalized = (Math.sin(hash) + 1) / 2;
  return normalized * range;
};

export const deriveQberFromWorkflow = (workflow: Workflow): number => {
  const quantumNodes = workflow.nodes.filter((node) =>
    node.type.startsWith('QUBE_'),
  ).length;
  if (!quantumNodes) {
    return 0;
  }
  const base = Math.max(0.008, 0.015 - quantumNodes * 0.0015);
  return Number(base.toFixed(4));
};

export const projectKpiForVariant = (
  workflow: Workflow,
  baseVersion: WorkflowVersion,
  variantId: string,
): WorkflowVersion['metricsSnapshot'] => {
  const spread = pseudoRandom(`${workflow.id}-${variantId}`, 0.2);
  const factor = 1 + spread * 0.35;
  const baseline = baseVersion.metricsSnapshot ?? {
    runs: 0,
    revenueUsd: 0,
    successRate: 0.7,
    avgLatencyMs: 300,
  };
  const qber = workflow.nodes.some((node) => node.type.startsWith('QUBE_'))
    ? deriveQberFromWorkflow(workflow)
    : undefined;
  return {
    runs: Math.round(baseline.runs * (1 + spread)),
    revenueUsd: Math.round(baseline.revenueUsd * factor),
    successRate: Math.min(0.99, baseline.successRate * (1 + spread / 4)),
    avgLatencyMs: Math.max(120, baseline.avgLatencyMs * (1 - spread / 5)),
    qber,
  };
};

export const buildSparkline = (version: WorkflowVersion): number[] => {
  const metrics = version.metricsSnapshot;
  if (!metrics) {
    return [0.45, 0.5, 0.48, 0.52, 0.55, 0.58, 0.6];
  }
  const base = metrics.revenueUsd || 1;
  return Array.from({ length: 7 }, (_, index) =>
    Number((base * (0.75 + index * 0.035)).toFixed(2)),
  );
};
