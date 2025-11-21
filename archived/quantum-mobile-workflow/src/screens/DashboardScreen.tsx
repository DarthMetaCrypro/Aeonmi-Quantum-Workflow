// src/screens/DashboardScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Workflow } from '../types';

type RootStackParamList = {
  Dashboard: undefined;
  WorkflowCanvas: { workflowId: string };
  RunHistory: { workflowId: string };
};

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    // Load sample workflows
    setWorkflows([
      {
        id: 'wf1',
        ownerId: 'user1',
        name: 'Quantum Publishing Pipeline',
        description: 'AI-powered content creation with BB84 encryption and Titan optimization.',
        status: 'active',
        nodes: [],
        edges: [],
        currentVersionId: 'v1',
        versions: [],
        evolutionPolicy: {
          enabled: true,
          maxVariants: 3,
          kpiPrimary: 'revenue',
          constraints: {
            mustUseQubeSecurity: true,
            maxLatencyMs: 5000,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'wf2',
        ownerId: 'user1',
        name: 'Revenue Optimization Engine',
        description: 'Self-evolving workflow for automated revenue optimization using quantum computing.',
        status: 'active',
        nodes: [],
        edges: [],
        currentVersionId: 'v1',
        versions: [],
        evolutionPolicy: {
          enabled: true,
          maxVariants: 5,
          kpiPrimary: 'conversion',
          constraints: {
            mustUseQubeSecurity: true,
            forbiddenIntegrations: ['legacy_api'],
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'wf3',
        ownerId: 'user1',
        name: 'API Gateway Protector',
        description: 'Quantum-secured API gateway with real-time threat detection and evolution.',
        status: 'draft',
        nodes: [],
        edges: [],
        currentVersionId: 'v1',
        versions: [],
        evolutionPolicy: {
          enabled: false,
          maxVariants: 2,
          kpiPrimary: 'throughput',
          constraints: {
            mustUseQubeSecurity: true,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const renderWorkflow = ({ item }: { item: Workflow }) => (
    <View style={styles.workflowCard}>
      <View style={styles.workflowHeader}>
        <Text style={styles.workflowName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.workflowDesc}>{item.description}</Text>

      <View style={styles.workflowActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WorkflowCanvas', { workflowId: item.id })}
        >
          <Text style={styles.actionButtonText}>Edit Canvas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('RunHistory', { workflowId: item.id })}
        >
          <Text style={styles.actionButtonText}>View History</Text>
        </TouchableOpacity>
      </View>

      {item.evolutionPolicy?.enabled && (
        <View style={styles.evolutionInfo}>
          <Text style={styles.evolutionText}>
            Evolution: {item.evolutionPolicy.kpiPrimary} optimization
          </Text>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#00ff88';
      case 'draft': return '#ffaa00';
      case 'paused': return '#ff4444';
      default: return '#666666';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quantum Workflows</Text>
      <FlatList
        data={workflows}
        renderItem={renderWorkflow}
        keyExtractor={(item) => item.id}
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
    fontSize: 24,
    color: '#00d4ff',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  workflowCard: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workflowName: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  workflowDesc: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 10,
  },
  workflowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  evolutionInfo: {
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ff6b00',
  },
  evolutionText: {
    color: '#ff6b00',
    fontSize: 12,
    fontWeight: 'bold',
  },
});