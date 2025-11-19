import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { BaseNodeComponent } from './BaseNode';
import { NodeProps } from './types';

export function WebhookNode(props: NodeProps) {
  const { node, onUpdate } = props;

  return (
    <BaseNodeComponent
      {...props}
      title="Webhook"
      color="#61dafb"
      icon="globe"
    >
      <View style={styles.content}>
        <Text style={styles.label}>URL:</Text>
        <TextInput
          style={styles.input}
          placeholder="https://api.example.com/webhook"
          value={node.config.url || ''}
          onChangeText={(url) => onUpdate({
            config: { ...node.config, url }
          })}
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Method:</Text>
        <TextInput
          style={styles.input}
          placeholder="POST"
          value={node.config.method || 'POST'}
          onChangeText={(method) => onUpdate({
            config: { ...node.config, method }
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
    color: '#61dafb',
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