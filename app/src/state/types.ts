import { Workflow, RunHistoryItem } from '../types';
import { WorkflowsSlice } from './workflows.slice';
import { UiSlice } from './ui.slice';
import { RunHistorySlice } from './runHistory.slice';
import { TemplatesSlice } from './templates.slice';
import { AuthSlice } from './auth.slice';

export type InitializationPayload = {
  workflows: Workflow[];
  runs: RunHistoryItem[];
  templates: Record<string, string>;
};

export type PersistSlice = {
  hydrated: boolean;
  initialize: (payloadFactory: () => InitializationPayload) => Promise<void>;
  setHydrated: (value: boolean) => void;
};

export type RootState = WorkflowsSlice &
  UiSlice &
  RunHistorySlice &
  TemplatesSlice &
  AuthSlice &
  PersistSlice;
