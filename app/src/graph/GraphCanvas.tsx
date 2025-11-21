import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';
import { Edge, Node, Workflow } from '../types';
import NodeView from './NodeView';
import EdgePath from '../components/EdgePath';
import { palette } from '../theme/colors';

const GRID_SIZE = 20;
const NODE_WIDTH = 220;

interface GraphCanvasProps {
  workflow: Workflow;
  onUpdateGraph: (nodes: Node[], edges: Edge[]) => void;
  onSelectNodes: (nodeIds: string[]) => void;
  selectedNodeIds: string[];
  onOpenPanel: (nodeId: string) => void;
  transform: { translateX: number; translateY: number; scale: number };
  onTransformChange: (transform: {
    translateX: number;
    translateY: number;
    scale: number;
  }) => void;
  multiSelectEnabled?: boolean;
}

const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  workflow,
  onUpdateGraph,
  onSelectNodes,
  selectedNodeIds,
  onOpenPanel,
  transform,
  onTransformChange,
  multiSelectEnabled = false,
}) => {
  const [draftNodes, setDraftNodes] = React.useState<Node[]>(workflow.nodes);
  const [draftEdges, setDraftEdges] = React.useState<Edge[]>(workflow.edges);
  const [connectingFrom, setConnectingFrom] = React.useState<{
    nodeId: string;
    portId: string;
  } | null>(null);

  // Reanimated shared values
  const translateX = useSharedValue(transform.translateX);
  const translateY = useSharedValue(transform.translateY);
  const scale = useSharedValue(transform.scale);
  const savedTranslateX = useSharedValue(transform.translateX);
  const savedTranslateY = useSharedValue(transform.translateY);
  const savedScale = useSharedValue(transform.scale);

  React.useEffect(() => {
    translateX.value = withTiming(transform.translateX);
    translateY.value = withTiming(transform.translateY);
    scale.value = withTiming(transform.scale);
    savedTranslateX.value = transform.translateX;
    savedTranslateY.value = transform.translateY;
    savedScale.value = transform.scale;
  }, [
    transform,
    translateX,
    translateY,
    scale,
    savedTranslateX,
    savedTranslateY,
    savedScale,
  ]);

  React.useEffect(() => {
    setDraftNodes(workflow.nodes);
    setDraftEdges(workflow.edges);
  }, [workflow.edges, workflow.nodes]);

  const handleNodeDrag = (nodeId: string, x: number, y: number, commit: boolean) => {
    setDraftNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              x: commit ? snap(x) : x,
              y: commit ? snap(y) : y,
            }
          : node,
      ),
    );
    if (commit) {
      const nextNodes = draftNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              x: snap(x),
              y: snap(y),
            }
          : node,
      );
      onUpdateGraph(nextNodes, draftEdges);
    }
  };

  const handlePortPress = (nodeId: string, portId: string, direction: 'in' | 'out') => {
    if (direction === 'out') {
      setConnectingFrom({ nodeId, portId });
      return;
    }
    if (connectingFrom) {
      const exists = draftEdges.some(
        (edge) =>
          edge.from.nodeId === connectingFrom.nodeId &&
          edge.from.portId === connectingFrom.portId &&
          edge.to.nodeId === nodeId &&
          edge.to.portId === portId,
      );
      if (!exists) {
        const newEdge: Edge = {
          id: `edge-${Date.now().toString(36)}`,
          from: connectingFrom,
          to: { nodeId, portId },
        };
        const nextEdges = [newEdge, ...draftEdges];
        setDraftEdges(nextEdges);
        onUpdateGraph(draftNodes, nextEdges);
      }
      setConnectingFrom(null);
    }
  };

  const selectNode = (node: Node) => {
    if (multiSelectEnabled) {
      if (selectedNodeIds.includes(node.id)) {
        onSelectNodes(selectedNodeIds.filter((id) => id !== node.id));
      } else {
        onSelectNodes([...selectedNodeIds, node.id]);
      }
    } else {
      onSelectNodes([node.id]);
    }
  };

  const openPanel = (node: Node) => {
    onOpenPanel(node.id);
  };

  const getNode = (nodeId: string) => draftNodes.find((node) => node.id === nodeId);

  const computePortCoordinates = (
    node: Node,
    portId: string,
    direction: 'in' | 'out',
  ) => {
    const portIndex = node.ports
      .filter((port) => port.direction === direction)
      .findIndex((port) => port.id === portId);
    const baseY = node.y + 60 + portIndex * 32;
    const xOffset = direction === 'out' ? NODE_WIDTH : 0;
    return {
      x: node.x + xOffset,
      y: baseY,
    };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.graphLayer}>
        {draftEdges.map((edge) => {
          const fromNode = getNode(edge.from.nodeId);
          const toNode = getNode(edge.to.nodeId);
          if (!fromNode || !toNode) {
            return null;
          }
          const fromPoint = computePortCoordinates(fromNode, edge.from.portId, 'out');
          const toPoint = computePortCoordinates(toNode, edge.to.portId, 'in');
          return (
            <EdgePath
              key={edge.id}
              from={fromPoint}
              to={toPoint}
              highlighted={selectedNodeIds.includes(edge.from.nodeId)}
            />
          );
        })}
        {draftNodes.map((node) => (
          <View key={node.id} style={{ position: 'absolute', left: node.x, top: node.y }}>
            <NodeView
              node={node}
              selected={selectedNodeIds.includes(node.id)}
              onSelect={selectNode}
              onOpenPanel={openPanel}
              onDrag={handleNodeDrag}
              onPortPress={handlePortPress}
              scale={transform.scale}
            />
          </View>
        ))}
      </View>
      {connectingFrom ? (
        <View style={styles.connectingHint}>
          <Text style={styles.connectingText}>Connect to target input…</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  scrollContent: {
    flexGrow: 1,
  },
  graphLayer: {
    flex: 1,
    minHeight: 1000,
  },
  connectingHint: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },
  connectingText: {
    color: palette.accentSecondary,
    fontSize: 14,
  },
});

export default GraphCanvas;
