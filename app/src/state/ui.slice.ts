import { GetState, SetState, StoreApi } from 'zustand';
import { RootState } from './types';

export type CanvasTransform = {
  translateX: number;
  translateY: number;
  scale: number;
};

export type UiSlice = {
  selectedNodeIds: string[];
  marqueeActive: boolean;
  microAgentPanelOpen: boolean;
  canvasTransform: CanvasTransform;
  undoStack: CanvasTransform[];
  redoStack: CanvasTransform[];
  aeonmiPreviewWorkflowId?: string;
  isBackendConnected: boolean;
  setBackendConnected: (connected: boolean) => void;
  setSelectedNodeIds: (nodeIds: string[]) => void;
  setMarqueeActive: (active: boolean) => void;
  toggleMicroAgentPanel: (open?: boolean) => void;
  setCanvasTransform: (transform: CanvasTransform, pushHistory?: boolean) => void;
  undoCanvas: () => void;
  redoCanvas: () => void;
  showAeonmiPreview: (workflowId?: string) => void;
};

export const createUiSlice = (
  set: SetState<RootState>,
  _get: GetState<RootState>,
  _store: StoreApi<RootState>,
): UiSlice => ({
  selectedNodeIds: [],
  marqueeActive: false,
  microAgentPanelOpen: false,
  canvasTransform: { translateX: 0, translateY: 0, scale: 1 },
  undoStack: [],
  redoStack: [],
  aeonmiPreviewWorkflowId: undefined,
  isBackendConnected: false,
  setBackendConnected: (connected) =>
    set(() => ({ isBackendConnected: connected }), false, 'ui/setBackendConnected'),
  setSelectedNodeIds: (nodeIds) =>
    set(() => ({ selectedNodeIds: nodeIds }), false, 'ui/setSelectedNodeIds'),
  setMarqueeActive: (active) =>
    set(() => ({ marqueeActive: active }), false, 'ui/setMarqueeActive'),
  toggleMicroAgentPanel: (open) =>
    set(
      (state: RootState) => ({
        microAgentPanelOpen: open !== undefined ? open : !state.microAgentPanelOpen,
      }),
      false,
      'ui/toggleMicroAgentPanel',
    ),
  setCanvasTransform: (transform, pushHistory = true) =>
    set(
      (state: RootState) => ({
        canvasTransform: transform,
        undoStack: pushHistory
          ? [...state.undoStack, state.canvasTransform]
          : state.undoStack,
        redoStack: pushHistory ? [] : state.redoStack,
      }),
      false,
      'ui/setCanvasTransform',
    ),
  undoCanvas: () =>
    set(
      (state: RootState) => {
        if (!state.undoStack.length) {
          return state;
        }
        const previous = state.undoStack[state.undoStack.length - 1];
        return {
          canvasTransform: previous,
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [state.canvasTransform, ...state.redoStack],
        };
      },
      false,
      'ui/undoCanvas',
    ),
  redoCanvas: () =>
    set(
      (state: RootState) => {
        if (!state.redoStack.length) {
          return state;
        }
        const [head, ...rest] = state.redoStack;
        return {
          canvasTransform: head,
          redoStack: rest,
          undoStack: [...state.undoStack, state.canvasTransform],
        };
      },
      false,
      'ui/redoCanvas',
    ),
  showAeonmiPreview: (workflowId) =>
    set(() => ({ aeonmiPreviewWorkflowId: workflowId }), false, 'ui/showAeonmiPreview'),
});
