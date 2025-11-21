import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { Node } from '../types';
import PortSocket from '../components/PortSocket';
import Badge from '../components/Badge';
import { palette } from '../theme/colors';

interface NodeViewProps {
  node: Node;
  selected?: boolean;
  onSelect: (node: Node) => void;
  onOpenPanel: (node: Node) => void;
  onDrag: (nodeId: string, x: number, y: number, commit: boolean) => void;
  onPortPress: (nodeId: string, portId: string, direction: 'in' | 'out') => void;
  scale?: number;
}

const NodeView: React.FC<NodeViewProps> = ({
  node,
  selected = false,
  onSelect,
  onOpenPanel,
  onDrag,
  onPortPress,
  scale = 1,
}) => {
  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY } = event.nativeEvent;
    onDrag(node.id, node.x + translationX / scale, node.y + translationY / scale, false);
  };

  const handleGestureState = (event: PanGestureHandlerStateChangeEvent) => {
    if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED
    ) {
      const { translationX, translationY } = event.nativeEvent;
      onDrag(node.id, node.x + translationX / scale, node.y + translationY / scale, true);
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleGestureState}
    >
      <View
        style={[styles.container, selected ? styles.selected : undefined]}
        accessible
        accessibilityLabel={`Node ${node.title}`}
        accessibilityRole="button"
      >
        <Pressable
          onPress={() => onSelect(node)}
          onLongPress={() => onOpenPanel(node)}
          style={styles.header}
        >
          <Text style={styles.title}>{node.title}</Text>
          <Text style={styles.subtitle}>{node.type.replace('_', ' ')}</Text>
        </Pressable>
        <View style={styles.badgesRow}>
          {node.type === 'LOCAL_LLM' && <Badge label="Local LLM" tone="warning" />}
          {node.badges?.map((badge) => (
            <Badge
              key={badge}
              label={badge === 'QuantumSecured' ? 'Quantum' : badge}
              tone="primary"
            />
          ))}
        </View>
        <View style={styles.portsRow}>
          <View style={styles.portColumn}>
            {node.ports
              .filter((port) => port.direction === 'in')
              .map((port) => (
                <PortSocket
                  key={port.id}
                  label={port.label}
                  direction="in"
                  onPress={() => onPortPress(node.id, port.id, 'in')}
                />
              ))}
          </View>
          <View style={styles.portColumn}>
            {node.ports
              .filter((port) => port.direction === 'out')
              .map((port) => (
                <PortSocket
                  key={port.id}
                  label={port.label}
                  direction="out"
                  onPress={() => onPortPress(node.id, port.id, 'out')}
                />
              ))}
          </View>
        </View>
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 200,
    backgroundColor: '#111924',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 18,
    padding: 14,
  },
  selected: {
    borderColor: palette.accentSecondary,
    shadowColor: palette.accentGlow,
    shadowOpacity: 0.7,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  portsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  portColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});

export default NodeView;
