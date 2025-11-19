import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { NodeProps, NodeData } from './types';

interface BaseNodeProps extends NodeProps {
  title: string;
  color: string;
  icon: string;
  children?: React.ReactNode;
}

export function BaseNodeComponent({
  node,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  title,
  color,
  icon,
  children
}: BaseNodeProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }] as any,
  }));

  const handlePress = () => {
    onSelect();
    scale.value = withTiming(isSelected ? 1 : 1.05);
  };

  const handleMicroAI = async () => {
    onUpdate({
      microAI: {
        ...node.microAI,
        isProcessing: true,
      }
    });

    // Simulate micro-AI processing
    setTimeout(() => {
      onUpdate({
        microAI: {
          ...node.microAI,
          isProcessing: false,
          response: `AI Response for ${title} node`,
          lastUpdated: Date.now(),
        }
      });
    }, 2000);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={[styles.node, { borderColor: color, backgroundColor: isSelected ? color + '20' : '#1a1d23' }]}
        onPress={handlePress}
        onLongPress={onDelete}
      >
        <View style={styles.header}>
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={[styles.title, { color }]}>{title}</Text>
          <TouchableOpacity onPress={() => setShowPrompt(!showPrompt)}>
            <Ionicons name="hardware-chip" size={16} color={color} />
          </TouchableOpacity>
        </View>

        {showPrompt && (
          <View style={styles.promptPanel}>
            <TextInput
              style={styles.promptInput}
              placeholder="Enter AI prompt..."
              value={node.microAI.prompt}
              onChangeText={(text) => onUpdate({
                microAI: { ...node.microAI, prompt: text }
              })}
              multiline
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={[styles.aiButton, { backgroundColor: color }]}
              onPress={handleMicroAI}
              disabled={node.microAI.isProcessing}
            >
              <Text style={styles.aiButtonText}>
                {node.microAI.isProcessing ? 'Processing...' : 'Run AI'}
              </Text>
            </TouchableOpacity>
            {node.microAI.response && (
              <Text style={styles.aiResponse}>{node.microAI.response}</Text>
            )}
          </View>
        )}

        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  node: {
    minWidth: 120,
    minHeight: 80,
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#1a1d23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  promptPanel: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#0f1419',
    borderRadius: 4,
  },
  promptInput: {
    backgroundColor: '#1a1d23',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 8,
    color: '#fff',
    fontSize: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  aiButton: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  aiButtonText: {
    color: '#0f1419',
    fontSize: 12,
    fontWeight: 'bold',
  },
  aiResponse: {
    color: '#61dafb',
    fontSize: 10,
    marginTop: 8,
    fontStyle: 'italic',
  },
});