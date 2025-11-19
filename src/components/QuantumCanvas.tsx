import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { NodeData } from '../nodes/types';

const { width, height } = Dimensions.get('window');

const getNodeColor = (type: string) => {
  const colors = {
    webhook: '#61dafb',
    loop: '#ff6b6b',
    titan: '#4ecdc4',
    qube: '#45b7d1',
    entropy: '#f9ca24',
    'voice-to-glyph': '#6c5ce7',
    'emotional-balancer': '#a29bfe',
  };
  return colors[type as keyof typeof colors] || '#61dafb';
};

interface QuantumCanvasProps {
  nodes: NodeData[];
  onNodeSelect: (node: NodeData) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<NodeData>) => void;
  onNodeDelete: (nodeId: string) => void;
}

export default function QuantumCanvas({
  nodes,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete
}: QuantumCanvasProps) {
  const canvasRef = useRef(null);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedCanvasStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: panX.value },
        { translateY: panY.value },
        { scale: scale.value },
      ],
    } as any;
  });

  const renderNode = (node: NodeData) => {
    const color = getNodeColor(node.type);

    return (
      <TouchableOpacity
        key={node.id}
        style={{
          position: 'absolute',
          left: node.position.x - 30,
          top: node.position.y - 30,
          width: 60,
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => onNodeSelect(node)}
        onLongPress={() => onNodeDelete(node.id)}
      >
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
            {node.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.canvasContainer, animatedCanvasStyle]}>
        <Canvas style={styles.canvas} ref={canvasRef}>
          {/* Grid background */}
          <GridBackground />
        </Canvas>

        {/* Render nodes as overlay */}
        {nodes.map(renderNode)}
      </Animated.View>
    </View>
  );
}

function GridBackground() {
  const path = Skia.Path.Make();

  // Draw grid lines
  for (let x = 0; x < width * 2; x += 50) {
    path.moveTo(x, 0);
    path.lineTo(x, height * 2);
  }
  for (let y = 0; y < height * 2; y += 50) {
    path.moveTo(0, y);
    path.lineTo(width * 2, y);
  }

  return (
    <Path
      path={path}
      color="#1a1d23"
      style="stroke"
      strokeWidth={1}
      opacity={0.3}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  canvasContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});