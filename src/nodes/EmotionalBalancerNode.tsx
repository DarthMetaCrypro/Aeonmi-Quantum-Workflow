import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseNodeComponent } from './BaseNode';
import { NodeProps } from './types';

export function EmotionalBalancerNode(props: NodeProps) {
  const { node, onUpdate } = props;

  const emotions = ['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Disgust'];
  const currentEmotion = node.config.currentEmotion || 'Neutral';

  const balanceEmotions = () => {
    // Simulate emotional balancing
    const balancedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = Math.random() * 100;
    onUpdate({
      config: {
        ...node.config,
        balancedEmotion,
        confidence: confidence.toFixed(1),
        timestamp: new Date().toISOString()
      }
    });
  };

  const emotionLevels = node.config.emotionLevels || {
    joy: 50,
    sadness: 30,
    anger: 20,
    fear: 15,
    surprise: 10,
    disgust: 5
  };

  return (
    <BaseNodeComponent
      {...props}
      title="Emotional Balancer"
      color="#f39c12"
      icon="heart"
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.balanceButton}
          onPress={balanceEmotions}
        >
          <Text style={styles.balanceText}>Balance Emotions</Text>
        </TouchableOpacity>

        <Text style={styles.currentEmotion}>
          Current: {currentEmotion}
        </Text>

        {node.config.balancedEmotion && (
          <View style={styles.balancedDisplay}>
            <Text style={styles.balancedLabel}>Balanced to:</Text>
            <Text style={styles.balancedEmotion}>
              {node.config.balancedEmotion}
            </Text>
            <Text style={styles.confidence}>
              Confidence: {node.config.confidence}%
            </Text>
            <Text style={styles.timestamp}>
              {node.config.timestamp ? new Date(node.config.timestamp).toLocaleTimeString() : ''}
            </Text>
          </View>
        )}

        <View style={styles.emotionLevels}>
          <Text style={styles.levelsLabel}>Emotion Levels:</Text>
          {Object.entries(emotionLevels).map(([emotion, level]) => (
            <View key={emotion} style={styles.emotionBar}>
              <Text style={styles.emotionName}>
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}:
              </Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: `${level}%` }
                  ]}
                />
              </View>
              <Text style={styles.emotionValue}>{`${level}%`}</Text>
            </View>
          ))}
        </View>
      </View>
    </BaseNodeComponent>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
  },
  balanceButton: {
    backgroundColor: '#f39c12',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceText: {
    color: '#0f1419',
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentEmotion: {
    color: '#f39c12',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
  },
  balancedDisplay: {
    backgroundColor: '#0f1419',
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  balancedLabel: {
    color: '#f39c12',
    fontSize: 8,
    fontWeight: 'bold',
  },
  balancedEmotion: {
    color: '#45b7d1',
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  confidence: {
    color: '#f39c12',
    fontSize: 8,
  },
  timestamp: {
    color: '#666',
    fontSize: 6,
    marginTop: 2,
  },
  emotionLevels: {
    marginTop: 8,
  },
  levelsLabel: {
    color: '#f39c12',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emotionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  emotionName: {
    color: '#f39c12',
    fontSize: 8,
    width: 50,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginHorizontal: 4,
  },
  bar: {
    height: '100%',
    backgroundColor: '#f39c12',
    borderRadius: 3,
  },
  emotionValue: {
    color: '#f39c12',
    fontSize: 8,
    width: 30,
    textAlign: 'right',
  },
});