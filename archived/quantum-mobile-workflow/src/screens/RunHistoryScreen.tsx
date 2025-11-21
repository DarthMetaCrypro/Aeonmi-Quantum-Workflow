// src/screens/RunHistoryScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { MetricsService, MetricsSnapshot } from '../services/MetricsService';

type RunHistoryRouteProp = RouteProp<{ RunHistory: { workflowId: string } }, 'RunHistory'>;

export const RunHistoryScreen: React.FC<{ route: RunHistoryRouteProp }> = ({ route }) => {
  const { workflowId } = route.params;
  const [metrics, setMetrics] = useState<MetricsSnapshot[]>([]);

  useEffect(() => {
    const loadMetrics = async () => {
      const historical = await MetricsService.getHistoricalMetrics(workflowId);
      setMetrics(historical);
    };
    loadMetrics();
  }, [workflowId]);

  const renderMetric = ({ item }: { item: MetricsSnapshot }) => (
    <View style={styles.metricCard}>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      <Text style={styles.metric}>Runs: {item.runs}</Text>
      <Text style={styles.metric}>Revenue: ${item.revenueUsd.toFixed(2)}</Text>
      <Text style={styles.metric}>Success Rate: {(item.successRate * 100).toFixed(1)}%</Text>
      <Text style={styles.metric}>Avg Latency: {item.avgLatencyMs.toFixed(0)}ms</Text>
      <Text style={styles.metric}>QBER: {(item.qber * 100).toFixed(3)}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Run History</Text>
      <FlatList
        data={metrics}
        renderItem={renderMetric}
        keyExtractor={(item) => item.timestamp}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: '#00d4ff',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  metricCard: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  timestamp: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 5,
  },
  metric: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 2,
  },
});