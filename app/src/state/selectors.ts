import { Workflow, WorkflowVersion } from '../types';
import { RootState } from './types';

export const selectWorkflowById = (
  state: RootState,
  workflowId?: string,
): Workflow | undefined => {
  if (!workflowId) {
    return undefined;
  }
  return state.workflows.find((workflow) => workflow.id === workflowId);
};

export const selectWorkflowsWithQuantum = (state: RootState): Workflow[] =>
  state.workflows.filter((workflow) =>
    workflow.nodes.some(
      (node) => node.type === 'QUBE_KEY' || node.type === 'QUBE_COMPUTE',
    ),
  );

export const selectCurrentWorkflow = (state: RootState): Workflow | undefined =>
  selectWorkflowById(state, state.currentWorkflowId);

export const selectWorkflowCurrentVersion = (
  workflow?: Workflow,
): WorkflowVersion | undefined => {
  if (!workflow) {
    return undefined;
  }
  return workflow.versions.find((version) => version.id === workflow.currentVersionId);
};

export const selectWorkflowSparkline = (workflow: Workflow): number[] => {
  const version = selectWorkflowCurrentVersion(workflow);
  if (!version?.metricsSnapshot) {
    return [0.4, 0.45, 0.5, 0.55, 0.65, 0.7, 0.75];
  }
  const base = version.metricsSnapshot.revenueUsd;
  const factor = Math.max(base, 1);
  return Array.from({ length: 7 }, (_, index) => (factor * (0.8 + index * 0.03)) / 1000);
};
