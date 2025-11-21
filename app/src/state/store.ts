import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, SetState, GetState, StoreApi } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { createWorkflowsSlice } from './workflows.slice';
import { createUiSlice } from './ui.slice';
import { createRunHistorySlice } from './runHistory.slice';
import { createTemplatesSlice } from './templates.slice';
import { createAuthSlice } from './auth.slice';
import { InitializationPayload, PersistSlice, RootState } from './types';

// Zustand keeps the state layer lightweight without the ceremony of Redux boilerplate
// while still providing predictable immutable updates across slices.
export const useRootStore = create<RootState>()(
  devtools(
    persist(
      (
        set: SetState<RootState>,
        get: GetState<RootState>,
        store: StoreApi<RootState>,
      ) => ({
        ...createWorkflowsSlice(set, get, store),
        ...createUiSlice(set, get, store),
        ...createRunHistorySlice(set, get, store),
        ...createTemplatesSlice(set, get, store),
        ...createAuthSlice(set as any, get as any, store as any),
        hydrated: false,
        setHydrated: (value: boolean) =>
          set(() => ({ hydrated: value }), false, 'persist/setHydrated'),
        initialize: async (payloadFactory: () => InitializationPayload) => {
          if (get().workflows.length) {
            set(() => ({ hydrated: true }), false, 'persist/alreadyHydrated');
            return;
          }
          const payload = payloadFactory();
          set(
            () => ({
              workflows: payload.workflows,
              runs: payload.runs,
              scriptTemplates: payload.templates,
            }),
            false,
            'persist/initializePayload',
          );
          set(() => ({ hydrated: true }), false, 'persist/setHydrated');
        },
      }),
      {
        name: 'quantumforge-root',
        version: 2,
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state: RootState) => ({
          workflows: state.workflows,
          runs: state.runs,
          scriptTemplates: state.scriptTemplates,
        }),
        onRehydrateStorage: () => (state?: PersistSlice & RootState) => {
          state?.setHydrated(true);
        },
        migrate: async (
          persistedState: (PersistSlice & RootState) | undefined,
          version: number,
        ) => {
          if (!persistedState) {
            return undefined;
          }
          if (version < 2) {
            return {
              ...persistedState,
              scriptTemplates: persistedState.scriptTemplates ?? {},
            } as PersistSlice & RootState;
          }
          return persistedState as PersistSlice & RootState;
        },
      },
    ),
  ),
);

export default useRootStore;
