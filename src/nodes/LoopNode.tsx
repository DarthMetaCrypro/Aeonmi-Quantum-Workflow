import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { BaseNodeComponent } from './BaseNode';
import { NodeProps } from './types';

export function LoopNode(props: NodeProps) {
  const { node, onUpdate } = props;

  return (
    <BaseNodeComponent
      {...props}
      title="Loop"
      color="#ff6b6b"
      icon="repeat"
    >
      <View style={styles.content}>
        <Text style={styles.label}>Iterations:</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          value={String(node.config.iterations || 1)}
          onChangeText={(text) => onUpdate({
            config: { ...node.config, iterations: parseInt(text) || 1 }
          })}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Delay (ms):</Text>
        <TextInput
          style={styles.input}
          placeholder="1000"
          value={String(node.config.delay || 1000)}
          onChangeText={(text) => onUpdate({
            config: { ...node.config, delay: parseInt(text) || 1000 }
          })}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Condition:</Text>
        <TextInput
          style={styles.input}
          placeholder="item.value > 0"
          value={node.config.condition || ''}
          onChangeText={(condition) => onUpdate({
            config: { ...node.config, condition }
          })}
          placeholderTextColor="#666"
        />
      </View>
    </BaseNodeComponent>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
  },
  label: {
    color: '#ff6b6b',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0f1419',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 6,
    color: '#fff',
    fontSize: 10,
    marginBottom: 8,
  },
});