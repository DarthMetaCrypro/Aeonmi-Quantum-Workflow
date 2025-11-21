import { GetState, SetState, StoreApi } from 'zustand';
import { RunHistoryItem } from '../types';
import { RootState } from './types';

export type RunHistorySlice = {
  runs: RunHistoryItem[];
  addRun: (run: RunHistoryItem) => void;
  addRuns: (runs: RunHistoryItem[]) => void;
  clear: () => void;
};

export const createRunHistorySlice = (
  set: SetState<RootState>,
  _get: GetState<RootState>,
  _store: StoreApi<RootState>,
): RunHistorySlice => ({
  runs: [],
  addRun: (run) =>
    set(
      (state: RootState) => ({ runs: [run, ...state.runs] }),
      false,
      'runHistory/addRun',
    ),
  addRuns: (runs) =>
    set(
      (state: RootState) => ({ runs: [...runs, ...state.runs] }),
      false,
      'runHistory/addRuns',
    ),
  clear: () => set(() => ({ runs: [] }), false, 'runHistory/clear'),
});
