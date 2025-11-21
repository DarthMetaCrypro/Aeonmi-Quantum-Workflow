import { GetState, SetState, StoreApi } from 'zustand';
import { RootState } from './types';

export type TemplatesSlice = {
  scriptTemplates: Record<string, string>;
  setTemplates: (templates: Record<string, string>) => void;
};

export const createTemplatesSlice = (
  set: SetState<RootState>,
  _get: GetState<RootState>,
  _store: StoreApi<RootState>,
): TemplatesSlice => ({
  scriptTemplates: {},
  setTemplates: (templates) =>
    set(() => ({ scriptTemplates: templates }), false, 'templates/setTemplates'),
});
