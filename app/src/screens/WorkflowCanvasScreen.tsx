import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GraphCanvas from '../graph/GraphCanvas';
import ToolbarButton from '../components/ToolbarButton';
import MicroAgentPanel from '../components/MicroAgentPanel';
import { palette } from '../theme/colors';
import useRootStore from '../state/store';
import { selectWorkflowById } from '../state/selectors';
import { Node, Edge, MicroAIConfig } from '../types';
import { validateWorkflow } from '../utils/validation';
import { mockSpinVariant } from '../mocks/evolution';
import { workflowToAeonmi } from '../utils/workflowToAeonmi';
import { RootState } from '../state/types';

const WorkflowCanvasScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const updateWorkflowGraph = useRootStore(
    (state: RootState) => state.updateWorkflowGraph,
  );
  const setSelectedNodeIds = useRootStore((state: RootState) => state.setSelectedNodeIds);
  const selectedNodeIds = useRootStore((state: RootState) => state.selectedNodeIds);
  const microAgentPanelOpen = useRootStore(
    (state: RootState) => state.microAgentPanelOpen,
  );
  const toggleMicroAgentPanel = useRootStore(
    (state: RootState) => state.toggleMicroAgentPanel,
  );
  const updateNodeConfig = useRootStore((state: RootState) => state.updateNodeConfig);
  const addVersion = useRootStore((state: RootState) => state.addVersion);
  const applyWorkflowStatus = useRootStore(
    (state: RootState) => state.applyWorkflowStatus,
  );
  const scriptTemplates = useRootStore((state: RootState) => state.scriptTemplates);
  const canvasTransform = useRootStore((state: RootState) => state.canvasTransform);
  const setCanvasTransform = useRootStore((state: RootState) => state.setCanvasTransform);
  const undoCanvas = useRootStore((state: RootState) => state.undoCanvas);
  const redoCanvas = useRootStore((state: RootState) => state.redoCanvas);
  const showAeonmiPreview = useRootStore((state: RootState) => state.showAeonmiPreview);
  const workflow = useRootStore((state: RootState) => {
    const id = state.currentWorkflowId ?? state.workflows[0]?.id;
    return selectWorkflowById(state, id);
  });

  const [multiSelectMode, setMultiSelectMode] = React.useState(false);

  if (!workflow) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No workflow selected</Text>
      </View>
    );
  }

  const handleGraphUpdate = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      updateWorkflowGraph(workflow.id, nodes, edges);
    },
    [workflow.id, updateWorkflowGraph],
  );

  const handleSelectNodes = useCallback(
    (nodeIds: string[]) => {
      setSelectedNodeIds(nodeIds);
    },
    [setSelectedNodeIds],
  );

  const handleOpenPanel = useCallback(
    (nodeId: string) => {
      setSelectedNodeIds([nodeId]);
      toggleMicroAgentPanel(true);
    },
    [setSelectedNodeIds, toggleMicroAgentPanel],
  );

  const handleSaveConfig = useCallback(
    (nodeId: string, config: Record<string, unknown>, microAIConfig?: MicroAIConfig) => {
      updateNodeConfig(workflow.id, nodeId, config, microAIConfig);
    },
    [workflow.id, updateNodeConfig],
  );

  const performValidation = useCallback(() => {
    const result = validateWorkflow(workflow);
    if (result.valid) {
      Alert.alert('Validation', 'Graph is valid.');
    } else {
      const details = result.issues.map((issue) => `• ${issue.message}`).join('\n');
      Alert.alert('Validation issues', details);
    }
  }, [workflow]);

  const runPreview = useCallback(() => {
    Alert.alert('Run Preview', 'Mock preview executed with no backend calls.');
  }, []);

  const saveDraft = useCallback(() => {
    const variant = mockSpinVariant(workflow);
    addVersion(workflow.id, variant);
    Alert.alert('Draft saved', `${variant.label} created.`);
  }, [workflow, addVersion]);

  const activateWorkflow = useCallback(() => {
    applyWorkflowStatus(workflow.id, 'active');
    Alert.alert('Workflow activated', `${workflow.name} is now active.`);
  }, [workflow.id, workflow.name, applyWorkflowStatus]);

  const openAeonmiPreview = useCallback(() => {
    showAeonmiPreview(workflow.id);
    navigation.navigate('AeonmiSourcePreview', {
      source: workflowToAeonmi(workflow),
    });
  }, [workflow, showAeonmiPreview, navigation]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.toolbar}
      >
        <ToolbarButton label="Undo" onPress={undoCanvas} />
        <ToolbarButton label="Redo" onPress={redoCanvas} />
        <ToolbarButton
          label={multiSelectMode ? 'Multi-Select: ON' : 'Multi-Select: OFF'}
          onPress={() => setMultiSelectMode(!multiSelectMode)}
          active={multiSelectMode}
        />
        <ToolbarButton label="Validate" onPress={performValidation} />
        <ToolbarButton label="Run Preview" onPress={runPreview} />
        <ToolbarButton label="Save Draft" onPress={saveDraft} />
        <ToolbarButton label="Activate" onPress={activateWorkflow} />
        <ToolbarButton label="Aeonmi" onPress={openAeonmiPreview} />
      </ScrollView>
      <View style={styles.canvasContainer}>
        <GraphCanvas
          workflow={workflow}
          onUpdateGraph={handleGraphUpdate}
          onSelectNodes={handleSelectNodes}
          selectedNodeIds={selectedNodeIds}
          onOpenPanel={handleOpenPanel}
          transform={canvasTransform}
          onTransformChange={(transform) => setCanvasTransform(transform)}
          multiSelectEnabled={multiSelectMode}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Nodes: {workflow.nodes.length}</Text>
        <Text style={styles.footerText}>Edges: {workflow.edges.length}</Text>
        <Text style={styles.footerText}>
          Est latency: {Math.max(120, 200 + workflow.edges.length * 12)}ms
        </Text>
        <Text style={styles.footerText}>
          Evolution: {workflow.evolutionPolicy?.enabled ? 'Auto' : 'Manual'}
        </Text>
      </View>
      <MicroAgentPanel
        visible={microAgentPanelOpen}
        node={workflow.nodes.find((node: Node) => node.id === selectedNodeIds[0])}
        onClose={() => toggleMicroAgentPanel(false)}
        onSaveConfig={handleSaveConfig}
        templates={scriptTemplates}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  toolbar: {
    maxHeight: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  canvasContainer: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0D131C',
  },
  footerText: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontSize: 20,
  },
});

export default WorkflowCanvasScreen;
