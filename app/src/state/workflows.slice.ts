import { GetState, SetState, StoreApi } from 'zustand';
import {
  Edge,
  EvolutionPolicy,
  Node,
  Workflow,
  WorkflowVersion,
  MicroAIConfig,
} from '../types';
import { workflowToAeonmi } from '../utils/workflowToAeonmi';
import { RootState } from './types';

export type WorkflowsSlice = {
  workflows: Workflow[];
  currentWorkflowId?: string;
  setWorkflows: (workflows: Workflow[]) => void;
  selectWorkflow: (workflowId?: string) => void;
  upsertWorkflow: (workflow: Workflow) => void;
  updateWorkflowGraph: (workflowId: string, nodes: Node[], edges: Edge[]) => void;
  setEvolutionPolicy: (workflowId: string, policy: EvolutionPolicy) => void;
  addVersion: (workflowId: string, version: WorkflowVersion) => void;
  updateVersion: (
    workflowId: string,
    versionId: string,
    partial: Partial<WorkflowVersion>,
  ) => void;
  applyWorkflowStatus: (workflowId: string, status: Workflow['status']) => void;
  updateNodeConfig: (
    workflowId: string,
    nodeId: string,
    config: Record<string, unknown>,
    microAIConfig?: MicroAIConfig,
  ) => void;
};

export const createWorkflowsSlice = (
  set: SetState<RootState>,
  _get: GetState<RootState>,
  _store: StoreApi<RootState>,
): WorkflowsSlice => ({
  workflows: [],
  currentWorkflowId: undefined,
  setWorkflows: (workflows: Workflow[]) =>
    set(() => ({ workflows }), false, 'workflows/setWorkflows'),
  selectWorkflow: (workflowId?: string) =>
    set(() => ({ currentWorkflowId: workflowId }), false, 'workflows/selectWorkflow'),
  upsertWorkflow: (workflow: Workflow) =>
    set(
      (state: RootState) => {
        const exists = state.workflows.some((wf: Workflow) => wf.id === workflow.id);
        const workflows = exists
          ? state.workflows.map((wf: Workflow) =>
              wf.id === workflow.id
                ? { ...workflow, updatedAt: new Date().toISOString() }
                : wf,
            )
          : [...state.workflows, workflow];
        return { workflows };
      },
      false,
      'workflows/upsertWorkflow',
    ),
  updateWorkflowGraph: (workflowId: string, nodes: Node[], edges: Edge[]) =>
    set(
      (state: RootState) => ({
        workflows: state.workflows.map((workflow: Workflow) =>
          workflow.id === workflowId
            ? {
                ...workflow,
                nodes,
                edges,
                updatedAt: new Date().toISOString(),
              }
            : workflow,
        ),
      }),
      false,
      'workflows/updateWorkflowGraph',
    ),
  setEvolutionPolicy: (workflowId: string, policy: EvolutionPolicy) =>
    set(
      (state: RootState) => ({
        workflows: state.workflows.map((workflow: Workflow) =>
          workflow.id === workflowId
            ? { ...workflow, evolutionPolicy: { ...policy } }
            : workflow,
        ),
      }),
      false,
      'workflows/setEvolutionPolicy',
    ),
  addVersion: (workflowId: string, version: WorkflowVersion) =>
    set(
      (state: RootState) => ({
        workflows: state.workflows.map((workflow: Workflow) => {
          if (workflow.id !== workflowId) {
            return workflow;
          }
          const hydratedVersion: WorkflowVersion = {
            ...version,
            aeonmiSource: version.aeonmiSource || workflowToAeonmi(workflow),
            createdAt: version.createdAt || new Date().toISOString(),
          };
          return {
            ...workflow,
            versions: [hydratedVersion, ...workflow.versions],
            currentVersionId: hydratedVersion.id,
            updatedAt: new Date().toISOString(),
          };
        }),
      }),
      false,
      'workflows/addVersion',
    ),
  updateVersion: (
    workflowId: string,
    versionId: string,
    partial: Partial<WorkflowVersion>,
  ) =>
    set(
      (state: RootState) => ({
        workflows: state.workflows.map((workflow: Workflow) => {
          if (workflow.id !== workflowId) {
            return workflow;
          }
          return {
            ...workflow,
            versions: workflow.versions.map((version: WorkflowVersion) =>
              version.id === versionId ? { ...version, ...partial } : version,
            ),
          };
        }),
      }),
      false,
      'workflows/updateVersion',
    ),
  applyWorkflowStatus: (workflowId: string, status: Workflow['status']) =>
    set(
      (state: RootState) => ({
        workflows: state.workflows.map((workflow: Workflow) =>
          workflow.id === workflowId
            ? { ...workflow, status, updatedAt: new Date().toISOString() }
            : workflow,
        ),
      }),
      false,
      'workflows/applyWorkflowStatus',
    ),
  updateNodeConfig: (
    workflowId: string,
    nodeId: string,
    config: Record<string, unknown>,
    microAIConfig?: MicroAIConfig,
  ) =>
    set(
      (state: RootState) => ({
        workflows: state.workflows.map((workflow: Workflow) => {
          if (workflow.id !== workflowId) {
            return workflow;
          }
          return {
            ...workflow,
            nodes: workflow.nodes.map((node) =>
              node.id === nodeId
                ? {
                    ...node,
                    config: { ...node.config, ...config },
                    microAIConfig: microAIConfig
                      ? { ...(node.microAIConfig || {}), ...microAIConfig }
                      : node.microAIConfig,
                  }
                : node,
            ),
            updatedAt: new Date().toISOString(),
          };
        }),
      }),
      false,
      'workflows/updateNodeConfig',
    ),
});
