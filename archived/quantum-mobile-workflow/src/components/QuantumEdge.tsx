// src/components/QuantumEdge.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';
import { Edge } from '../types';

interface QuantumEdgeProps {
  edge: Edge;
  sourceNode: { position: { x: number; y: number } };
  targetNode: { position: { x: number; y: number } };
  isSelected?: boolean;
}

export const QuantumEdge: React.FC<QuantumEdgeProps> = ({
  edge,
  sourceNode,
  targetNode,
  isSelected = false,
}) => {
  // Calculate connection points (center of nodes)
  const sourceX = sourceNode.position.x + 60; // Half width
  const sourceY = sourceNode.position.y + 40; // Half height
  const targetX = targetNode.position.x + 60;
  const targetY = targetNode.position.y + 40;

  // Calculate arrowhead position
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angle = Math.atan2(dy, dx);
  const arrowLength = 10;

  const arrowX = targetX - arrowLength * Math.cos(angle);
  const arrowY = targetY - arrowLength * Math.sin(angle);

  // Arrowhead points
  const arrowPoints = [
    targetX,
    targetY,
    arrowX + arrowLength * Math.cos(angle - Math.PI / 6),
    arrowY + arrowLength * Math.sin(angle - Math.PI / 6),
    arrowX + arrowLength * Math.cos(angle + Math.PI / 6),
    arrowY + arrowLength * Math.sin(angle + Math.PI / 6),
  ].join(' ');

  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Line
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
          stroke={isSelected ? '#00d4ff' : '#666666'}
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray={isSelected ? undefined : '5,5'}
        />
        <Polygon
          points={arrowPoints}
          fill={isSelected ? '#00d4ff' : '#666666'}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});