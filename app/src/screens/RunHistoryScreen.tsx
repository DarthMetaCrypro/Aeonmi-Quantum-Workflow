import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import useRootStore from '../state/store';
import { palette } from '../theme/colors';
import { RunHistoryItem, Workflow, WorkflowVersion } from '../types';
import { RootState } from '../state/types';
import KpiSparkline from '../components/KpiSparkline';
import { buildSparkline } from '../mocks/metrics';

const RunHistoryScreen: React.FC = () => {
  const runs = useRootStore((state: RootState) => state.runs);
  const workflows = useRootStore((state: RootState) => state.workflows);
  const [resultFilter, setResultFilter] = React.useState<
    'all' | 'success' | 'error' | 'partial'
  >('all');
  const [versionFilter, setVersionFilter] = React.useState<string | 'all'>('all');

  const workflowMap = React.useMemo(() => {
    const map = new Map<string, Workflow>();
    workflows.forEach((workflow: Workflow) => {
      map.set(workflow.id, workflow);
    });
    return map;
  }, [workflows]);

  const sparklineLookup = React.useMemo(() => {
    const map = new Map<string, number[]>();
    workflows.forEach((workflow: Workflow) => {
      workflow.versions.forEach((version: WorkflowVersion) => {
        map.set(version.id, buildSparkline(version));
      });
    });
    return map;
  }, [workflows]);

  const filteredRuns = React.useMemo(
    () =>
      runs.filter(
        (run: RunHistoryItem) =>
          (resultFilter === 'all' || run.result === resultFilter) &&
          (versionFilter === 'all' || run.versionId === versionFilter),
      ),
    [runs, resultFilter, versionFilter],
  );

  const openDetails = (run: RunHistoryItem) => {
    Alert.alert(
      'Run details',
      `Version: ${run.versionId}\nLatency: ${run.latencyMs}ms\nRevenue Δ: $${run.revenueUsdDelta}\nQBER: ${run.kpiSnapshot.qber ?? 'n/a'}`,
    );
  };

  const renderItem = ({ item }: { item: RunHistoryItem }) => {
    const workflow = workflowMap.get(item.workflowId);
    const version = workflow?.versions.find(
      (candidate: WorkflowVersion) => candidate.id === item.versionId,
    );
    const sparkline = sparklineLookup.get(item.versionId) ?? buildRunSparkline(item);
    const resultTint = resultColor[item.result];

    return (
      <Pressable style={styles.row} onPress={() => openDetails(item)}>
        <View style={styles.rowHeader}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.workflowName}>{workflow?.name ?? item.workflowId}</Text>
            <Text style={styles.versionLabel}>
              {version?.label ?? item.versionId} ·{' '}
              {new Date(item.executedAt).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.resultBadge, { borderColor: resultTint }]}>
            <Text style={[styles.resultText, { color: resultTint }]}>
              {item.result.toUpperCase()}
            </Text>
          </View>
        </View>

        {sparkline.length ? (
          <View style={styles.sparklineContainer}>
            <KpiSparkline data={sparkline} width={160} height={48} />
          </View>
        ) : null}

        <View style={styles.metricsGrid}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Δ Revenue</Text>
            <Text style={styles.metricValue}>${formatNumber(item.revenueUsdDelta)}</Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Latency</Text>
            <Text style={styles.metricValue}>{item.latencyMs}ms</Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Throughput</Text>
            <Text style={styles.metricValue}>
              {formatNumber(item.kpiSnapshot.throughput)}/min
            </Text>
          </View>
        </View>

        <View style={styles.kpiFooter}>
          <Text style={styles.kpiFooterText}>
            Conversion {(item.kpiSnapshot.conversion * 100).toFixed(1)}%
          </Text>
          <Text style={styles.kpiFooterText}>
            Revenue ${formatNumber(item.kpiSnapshot.revenue)}
          </Text>
          {item.kpiSnapshot.qber != null ? (
            <Text style={styles.kpiFooterText}>
              QBER {item.kpiSnapshot.qber.toFixed(3)}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const versionOptions = React.useMemo(
    () =>
      workflows.flatMap((workflow: Workflow) =>
        workflow.versions.map((version: WorkflowVersion) => version.id),
      ),
    [workflows],
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Result</Text>
          {(['all', 'success', 'error', 'partial'] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => setResultFilter(option)}
              style={[
                styles.filterChip,
                resultFilter === option ? styles.filterChipActive : undefined,
              ]}
            >
              <Text style={styles.filterChipText}>{option.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Version</Text>
          <Pressable
            onPress={() => setVersionFilter('all')}
            style={[
              styles.filterChip,
              versionFilter === 'all' ? styles.filterChipActive : undefined,
            ]}
          >
            <Text style={styles.filterChipText}>ALL</Text>
          </Pressable>
          {versionOptions.map((option: string) => (
            <Pressable
              key={option}
              onPress={() => setVersionFilter(option)}
              style={[
                styles.filterChip,
                versionFilter === option ? styles.filterChipActive : undefined,
              ]}
            >
              <Text style={styles.filterChipText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <FlatList
        data={filteredRuns}
        keyExtractor={(item: RunHistoryItem) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No runs yet</Text>
            <Text style={styles.emptySubtitle}>
              Activate a workflow to collect telemetry.
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const resultColor: Record<RunHistoryItem['result'], string> = {
  success: palette.success,
  error: palette.danger,
  partial: palette.warning,
};

const buildRunSparkline = (run: RunHistoryItem): number[] => {
  const base = Math.max(1, run.revenueUsdDelta);
  return Array.from({ length: 6 }, (_, index) =>
    Number((base * (0.68 + index * 0.07)).toFixed(2)),
  );
};

const formatNumber = (value: number): string => {
  return Number.isFinite(value) ? value.toLocaleString() : '—';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
    padding: 16,
  },
  filters: {
    marginBottom: 16,
  },
  filterGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  filterLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    marginRight: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F2A37',
  },
  filterChipActive: {
    borderColor: palette.accentSecondary,
    backgroundColor: '#102436',
  },
  filterChipText: {
    color: palette.textPrimary,
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 120,
  },
  row: {
    backgroundColor: '#101722',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2A37',
    padding: 16,
    marginBottom: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  workflowName: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  versionLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  resultBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sparklineContainer: {
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  metricBlock: {
    flex: 1,
    backgroundColor: '#0E1622',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1B2735',
  },
  metricLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  kpiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiFooterText: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: palette.textSecondary,
    marginTop: 8,
  },
});

export default RunHistoryScreen;
