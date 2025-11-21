import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import QuantumBadge from '../components/QuantumBadge';
import KpiSparkline from '../components/KpiSparkline';
import Fab from '../components/Fab';
import { palette } from '../theme/colors';
import useRootStore from '../state/store';
import { selectWorkflowSparkline } from '../state/selectors';
import { Workflow, RunHistoryItem } from '../types';
import { generateId } from '../utils/id';
import { motherAI, OrchestrationEvent } from '../services/MotherAI';
import BackendStatus from '../components/BackendStatus';
import { RootState } from '../state/types';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const workflows = useRootStore((state: RootState) => state.workflows);
  const runs = useRootStore((state: RootState) => state.runs);
  const upsertWorkflow = useRootStore((state: RootState) => state.upsertWorkflow);
  const selectWorkflow = useRootStore((state: RootState) => state.selectWorkflow);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'paused'>(
    'all',
  );
  const [motherEvents, setMotherEvents] = useState<OrchestrationEvent[]>([]);

  useEffect(() => {
    setMotherEvents(motherAI.getSystemStatus());
  }, []);

  const filteredWorkflows = useMemo(() => {
    return workflows
      .filter((workflow: Workflow) =>
        statusFilter === 'all' ? true : workflow.status === statusFilter,
      )
      .filter((workflow: Workflow) =>
        search
          ? workflow.name.toLowerCase().includes(search.toLowerCase()) ||
            workflow.description?.toLowerCase().includes(search.toLowerCase())
          : true,
      );
  }, [workflows, statusFilter, search]);

  const revenueTotal = useMemo(
    () => runs.reduce((acc: number, run: RunHistoryItem) => acc + run.revenueUsdDelta, 0),
    [runs],
  );

  const createWorkflow = useCallback(() => {
    const workflow: Workflow = {
      id: generateId('wf'),
      ownerId: 'owner-local',
      name: 'New Workflow',
      description: 'Start connecting nodes to build automation.',
      status: 'draft',
      nodes: [],
      edges: [],
      currentVersionId: generateId('ver'),
      versions: [
        {
          id: generateId('ver'),
          label: 'Draft v1',
          createdAt: new Date().toISOString(),
          aeonmiSource: 'flow draft {}',
          status: 'experimental',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertWorkflow(workflow);
    selectWorkflow(workflow.id);
    navigation.navigate('Canvas');
  }, [upsertWorkflow, selectWorkflow, navigation]);

  const renderWorkflow = useCallback(
    ({ item }: { item: Workflow }) => {
      const hasQuantum = item.nodes.some((node) => node.type.startsWith('QUBE_'));
      const kpi = item.versions[0]?.metricsSnapshot;
      const sparkline = selectWorkflowSparkline(item);
      return (
        <TouchableOpacity
          style={styles.workflowCardWrapper}
          onPress={() => {
            selectWorkflow(item.id);
            navigation.navigate('Canvas');
          }}
          accessibilityLabel={`Open workflow ${item.name}`}
          accessibilityRole="button"
        >
          <Card>
            <View style={styles.workflowHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.workflowName}>{item.name}</Text>
                <Text style={styles.workflowStatus}>{item.status.toUpperCase()}</Text>
              </View>
              {hasQuantum ? <QuantumBadge /> : null}
            </View>
            <View style={styles.workflowBody}>
              <View>
                <Text style={styles.metricLabel}>7 Day Revenue</Text>
                <Text style={styles.metricValue}>
                  ${(kpi?.revenueUsd ?? 0).toLocaleString()}
                </Text>
                <Text style={styles.metricSub}>
                  Success {Math.round((kpi?.successRate ?? 0.72) * 100)}%
                </Text>
              </View>
              <KpiSparkline data={sparkline} />
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [selectWorkflow, navigation],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Workflow Telemetry</Text>
          <Text style={styles.subtitle}>
            Optimize revenue with quantum-secured automation
          </Text>
        </View>
        <BackendStatus />
      </View>
      <View style={styles.filterRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search workflows"
          placeholderTextColor="#475569"
          style={styles.search}
        />
        <View style={styles.filterButtons}>
          {(['all', 'active', 'draft', 'paused'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterButton,
                statusFilter === option ? styles.filterButtonActive : undefined,
              ]}
              onPress={() => setStatusFilter(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: statusFilter === option }}
            >
              <Text style={styles.filterText}>{option.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.metricsRow}>
        <Card elevated>
          <Text style={styles.metricHeadline}>Total Revenue Impact</Text>
          <Text style={styles.metricHeadlineValue}>${revenueTotal.toLocaleString()}</Text>
        </Card>
        <Card>
          <Text style={styles.metricHeadline}>Mother AI Status</Text>
          <Text style={styles.metricHeadlineValue}>
            {motherEvents.length > 0 ? 'Optimizing' : 'Idle'}
          </Text>
          {motherEvents.length > 0 && (
            <Text style={{ color: palette.accentPrimary, fontSize: 12, marginTop: 4 }}>
              {motherEvents[0].message}
            </Text>
          )}
        </Card>
        <Card>
          <Text style={styles.metricHeadline}>Workflows</Text>
          <Text style={styles.metricHeadlineValue}>{workflows.length}</Text>
        </Card>
        <Card>
          <Text style={styles.metricHeadline}>Active Experiments</Text>
          <Text style={styles.metricHeadlineValue}>
            {
              workflows.filter((workflow: Workflow) =>
                workflow.versions.some(
                  (version: Workflow['versions'][number]) =>
                    version.status === 'experimental',
                ),
              ).length
            }
          </Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Text
          style={{
            color: palette.textSecondary,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 12,
          }}
        >
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AlgorithmVisualization')}
          >
            <Text style={styles.quickActionIcon}>⚛️</Text>
            <Text style={styles.quickActionText}>Quantum Algorithms</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('QuantumML')}
          >
            <Text style={styles.quickActionIcon}>🧠</Text>
            <Text style={styles.quickActionText}>Quantum ML</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Optimization')}
          >
            <Text style={styles.quickActionIcon}>⚡</Text>
            <Text style={styles.quickActionText}>AI Optimize</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredWorkflows}
        keyExtractor={(item: Workflow) => item.id}
        renderItem={renderWorkflow}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Create your first workflow</Text>
            <Text style={styles.emptySubtitle}>
              Design edge-ready automations with QUBE security and Titan evolution.
            </Text>
          </View>
        )}
      />
      <Fab label="New Workflow" onPress={createWorkflow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  search: {
    flex: 1,
    backgroundColor: '#101721',
    color: palette.textPrimary,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterButtonActive: {
    borderColor: palette.accentSecondary,
    backgroundColor: '#102436',
  },
  filterText: {
    color: palette.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricHeadline: {
    color: palette.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  metricHeadlineValue: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  workflowCardWrapper: {
    marginBottom: 16,
  },
  workflowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workflowName: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  workflowStatus: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
  workflowBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  metricLabel: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  metricValue: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 20,
    marginTop: 4,
  },
  metricSub: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    marginTop: 60,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: palette.textSecondary,
    textAlign: 'center',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.accentPrimary,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickActionText: {
    color: palette.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default DashboardScreen;
