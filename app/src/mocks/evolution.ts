import { Workflow, WorkflowVersion } from '../types';
import { projectKpiForVariant } from './metrics';
import { workflowToAeonmi } from '../utils/workflowToAeonmi';

const variantLabel = (workflow: Workflow, index: number) =>
  `${workflow.name.split(' ')[0]} Variant ${index}`;

export const mockSpinVariant = (workflow: Workflow): WorkflowVersion => {
  const baseVersion =
    workflow.versions.find((version) => version.id === workflow.currentVersionId) ||
    workflow.versions[0];
  const variantIndex = workflow.versions.length + 1;
  const variantId = `${workflow.id}-variant-${variantIndex}`;
  return {
    id: variantId,
    parentVersionId: baseVersion?.id,
    label: variantLabel(workflow, variantIndex),
    createdAt: new Date().toISOString(),
    status: 'experimental',
    aeonmiSource: workflowToAeonmi(workflow),
    metricsSnapshot: projectKpiForVariant(workflow, baseVersion, variantId),
  };
};

type AbPhase = 'idle' | 'running' | 'completed';

export type AbTestState = {
  workflowId: string;
  baseVersionId: string;
  variantVersionId: string;
  phase: AbPhase;
  winnerVersionId?: string;
};

export const mockStartAB = (
  workflow: Workflow,
  baseVersionId: string,
  variantVersionId: string,
): AbTestState => ({
  workflowId: workflow.id,
  baseVersionId,
  variantVersionId,
  phase: 'running',
});

export const mockEvaluateAB = (
  workflow: Workflow,
  baseVersionId: string,
  variantVersionId: string,
): AbTestState => {
  const baseVersion = workflow.versions.find((version) => version.id === baseVersionId);
  const variantVersion = workflow.versions.find(
    (version) => version.id === variantVersionId,
  );
  const baseScore = baseVersion?.metricsSnapshot?.revenueUsd ?? 0;
  const variantScore = variantVersion?.metricsSnapshot?.revenueUsd ?? 0;
  const winnerVersionId = variantScore >= baseScore ? variantVersionId : baseVersionId;
  return {
    workflowId: workflow.id,
    baseVersionId,
    variantVersionId,
    phase: 'completed',
    winnerVersionId,
  };
};
