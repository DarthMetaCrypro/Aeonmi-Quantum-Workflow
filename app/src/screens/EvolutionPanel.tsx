import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import useRootStore from '../state/store';
import { selectWorkflowById } from '../state/selectors';
import { palette } from '../theme/colors';
import { RootState } from '../state/types';
import { EvolutionPolicy, WorkflowVersion } from '../types';
import PillToggle from '../components/PillToggle';
import VersionChip from '../components/VersionChip';
import { mockSpinVariant, mockStartAB, mockEvaluateAB } from '../mocks/evolution';

interface EvolutionFormValues {
  enabled: boolean;
  maxVariants: number;
  kpiPrimary: EvolutionPolicy['kpiPrimary'];
  mustUseQubeSecurity: boolean;
  maxLatencyMs?: number;
  forbiddenIntegrationsText: string;
}

import { motherAI, EvolutionLog } from '../services/MotherAI';

const EvolutionPanel: React.FC = () => {
  const workflow = useRootStore((state: RootState) => {
    const id = state.currentWorkflowId ?? state.workflows[0]?.id;
    return selectWorkflowById(state, id);
  });
  const setEvolutionPolicy = useRootStore((state: RootState) => state.setEvolutionPolicy);
  const addVersion = useRootStore((state: RootState) => state.addVersion);
  const updateVersion = useRootStore((state: RootState) => state.updateVersion);
  const [abState, setAbState] = React.useState<{
    base?: string;
    variant?: string;
    phase: 'idle' | 'running' | 'completed';
    winner?: string;
  }>({ phase: 'idle' });
  const [rationaleVisible, setRationaleVisible] = React.useState(false);
  const [logs, setLogs] = React.useState<EvolutionLog[]>([]);

  React.useEffect(() => {
    if (workflow) {
      setLogs(motherAI.getEvolutionLogs(workflow.id));
    }
  }, [workflow]);

  const triggerFeedbackLoop = () => {
    if (workflow) {
      const log = motherAI.processFeedbackLoop(workflow);
      if (log) {
        setLogs((prev) => [log, ...prev]);
        Alert.alert('Feedback Loop Triggered', log.outcome);
      } else {
        Alert.alert(
          'Evolution Disabled',
          'Enable evolution policy to run feedback loops.',
        );
      }
    }
  };

  const methods = useForm<EvolutionFormValues>({
    defaultValues: {
      enabled: workflow?.evolutionPolicy?.enabled ?? false,
      maxVariants: workflow?.evolutionPolicy?.maxVariants ?? 3,
      kpiPrimary: workflow?.evolutionPolicy?.kpiPrimary ?? 'revenue',
      mustUseQubeSecurity:
        workflow?.evolutionPolicy?.constraints.mustUseQubeSecurity ?? false,
      maxLatencyMs: workflow?.evolutionPolicy?.constraints.maxLatencyMs,
      forbiddenIntegrationsText:
        workflow?.evolutionPolicy?.constraints.forbiddenIntegrations?.join(', ') ?? '',
    },
  });

  if (!workflow) {
    return null;
  }

  const savePolicy = (values: EvolutionFormValues) => {
    const forbidden = values.forbiddenIntegrationsText
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    const policy: EvolutionPolicy = {
      enabled: values.enabled,
      maxVariants: values.maxVariants,
      kpiPrimary: values.kpiPrimary,
      constraints: {
        mustUseQubeSecurity: values.mustUseQubeSecurity,
        maxLatencyMs: values.maxLatencyMs,
        forbiddenIntegrations: forbidden.length ? forbidden : undefined,
      },
    };
    setEvolutionPolicy(workflow.id, policy);
    Alert.alert('Evolution policy updated');
  };

  const spinVariant = () => {
    const variant = mockSpinVariant(workflow);
    addVersion(workflow.id, variant);
    setAbState({ phase: 'idle', base: workflow.currentVersionId, variant: variant.id });
  };

  const startAb = () => {
    const base = workflow.currentVersionId;
    const variant = workflow.versions.find(
      (version: WorkflowVersion) => version.status === 'experimental',
    )?.id;
    if (!variant) {
      Alert.alert('No variant', 'Spin a variant before starting A/B.');
      return;
    }
    const state = mockStartAB(workflow, base, variant);
    setAbState({ phase: state.phase, base: base, variant });
  };

  const evaluateAb = () => {
    if (!abState.base || !abState.variant) {
      return;
    }
    const result = mockEvaluateAB(workflow, abState.base, abState.variant);
    setAbState({
      phase: result.phase,
      base: abState.base,
      variant: abState.variant,
      winner: result.winnerVersionId,
    });
    if (result.winnerVersionId) {
      updateVersion(workflow.id, result.winnerVersionId, { status: 'live' });
      Alert.alert('A/B complete', `Winner: ${result.winnerVersionId}`);
    }
  };

  const promoteWinner = () => {
    if (!abState.winner) {
      Alert.alert('No winner yet');
      return;
    }
    updateVersion(workflow.id, abState.winner, { status: 'live' });
    Alert.alert('Winner promoted', 'Workflow now uses the winning variant.');
  };

  const openRationale = () => setRationaleVisible(true);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Titan Evolution</Text>
        <Text style={styles.subtitle}>
          Configure auto-evolving policies, monitor variants, and promote winners.
        </Text>
        <View style={styles.section}>
          <Controller
            control={methods.control}
            name="enabled"
            render={({
              field: { value, onChange },
            }: {
              field: { value: boolean; onChange: (value: boolean) => void };
            }) => (
              <PillToggle
                label="Auto-evolve with Titan"
                value={value}
                onValueChange={(val: boolean) => onChange(val)}
              />
            )}
          />
          <View style={styles.inputRow}>
            <Text style={styles.label}>Max Variants</Text>
            <Controller
              control={methods.control}
              name="maxVariants"
              render={({
                field,
              }: {
                field: { value: number; onChange: (value: number) => void };
              }) => (
                <Pressable
                  style={styles.valueBox}
                  onPress={() => field.onChange(Math.min(8, field.value + 1))}
                  onLongPress={() => field.onChange(Math.max(1, field.value - 1))}
                >
                  <Text style={styles.valueText}>{field.value}</Text>
                </Pressable>
              )}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Primary KPI</Text>
            <View style={styles.chipRow}>
              {(['revenue', 'conversion', 'throughput'] as const).map((option) => (
                <Controller
                  key={option}
                  control={methods.control}
                  name="kpiPrimary"
                  render={({
                    field,
                  }: {
                    field: {
                      value: EvolutionPolicy['kpiPrimary'];
                      onChange: (value: EvolutionPolicy['kpiPrimary']) => void;
                    };
                  }) => (
                    <Pressable
                      onPress={() => field.onChange(option)}
                      style={[
                        styles.chip,
                        field.value === option ? styles.chipActive : undefined,
                      ]}
                    >
                      <Text style={styles.chipText}>{option.toUpperCase()}</Text>
                    </Pressable>
                  )}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Constraints</Text>
          <Controller
            control={methods.control}
            name="mustUseQubeSecurity"
            render={({
              field: { value, onChange },
            }: {
              field: { value: boolean; onChange: (value: boolean) => void };
            }) => (
              <PillToggle
                label="Require QUBE Security"
                value={value}
                onValueChange={(val: boolean) => onChange(val)}
              />
            )}
          />
          <Controller
            control={methods.control}
            name="maxLatencyMs"
            render={({
              field,
            }: {
              field: {
                value: number | undefined;
                onChange: (value: number | undefined) => void;
              };
            }) => (
              <Pressable
                style={styles.valueBox}
                onPress={() => field.onChange((field.value ?? 400) - 10)}
                onLongPress={() => field.onChange((field.value ?? 400) + 10)}
              >
                <Text style={styles.valueText}>{field.value ?? 400} ms</Text>
              </Pressable>
            )}
          />
          <Controller
            control={methods.control}
            name="forbiddenIntegrationsText"
            render={({
              field,
            }: {
              field: { value: string; onChange: (value: string) => void };
            }) => (
              <Pressable
                accessibilityRole="button"
                style={styles.inputArea}
                onPress={() =>
                  Alert.alert('Forbidden Integrations', 'Edit via console for now.')
                }
                onLongPress={() => field.onChange('legacy-crm, legacy-payments')}
              >
                <Text style={styles.textAreaValue}>
                  {field.value?.length ? field.value : 'legacy-crm, legacy-payments'}
                </Text>
              </Pressable>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Version Timeline</Text>
          {workflow.versions.map((version: WorkflowVersion) => (
            <View key={version.id} style={styles.versionRow}>
              <VersionChip label={version.label} status={version.status} />
              <View style={styles.versionMetrics}>
                <Text style={styles.versionMetric}>
                  Revenue ${version.metricsSnapshot?.revenueUsd ?? 0}
                </Text>
                <Text style={styles.versionMetric}>
                  SR {(version.metricsSnapshot?.successRate ?? 0.7) * 100}%
                </Text>
                {version.metricsSnapshot?.qber !== undefined ? (
                  <Text style={styles.versionMetric}>
                    QBER {version.metricsSnapshot.qber}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity style={styles.rationaleButton} onPress={openRationale}>
                <Text style={styles.rationaleText}>Inspect rationale</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={spinVariant}>
              <Text style={styles.actionText}>Spin Variant</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={startAb}>
              <Text style={styles.actionText}>Start A/B</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={evaluateAb}>
              <Text style={styles.actionText}>Evaluate</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={promoteWinner}>
              <Text style={styles.actionText}>Promote Winner</Text>
            </Pressable>
          </View>
          <Text style={styles.abStatus}>A/B Status: {abState.phase}</Text>
          {abState.winner ? (
            <Text style={styles.abStatus}>Winner: {abState.winner}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Self-Evolving Feedback Loop</Text>
          <Text style={styles.sectionDesc}>
            Mother AI continuously monitors KPI drift and auto-tunes parameters.
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={triggerFeedbackLoop}>
              <Text style={styles.actionText}>Trigger Feedback Loop</Text>
            </TouchableOpacity>
          </View>
          {logs.length > 0 && (
            <View style={{ marginTop: 16, gap: 8 }}>
              {logs.map((log) => (
                <View
                  key={log.id}
                  style={{ backgroundColor: '#0B0F14', padding: 12, borderRadius: 8 }}
                >
                  <Text style={{ color: palette.accentPrimary, fontWeight: '600' }}>
                    {log.action}
                  </Text>
                  <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                    {log.reason}
                  </Text>
                  <Text style={{ color: palette.success, fontSize: 12, marginTop: 4 }}>
                    {log.outcome}
                  </Text>
                  <Text style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable style={styles.saveButton} onPress={methods.handleSubmit(savePolicy)}>
          <Text style={styles.saveText}>Save Policy</Text>
        </Pressable>
      </ScrollView>

      <Modal transparent visible={rationaleVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Titan Rationale</Text>
            <Text style={styles.modalText}>
              Titan optimizer leveraged Meta Evolver exploration with quantum-safe
              guardrails to converge on improved conversion at acceptable latency.
            </Text>
            <Pressable
              onPress={() => setRationaleVisible(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  section: {
    backgroundColor: '#101722',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1C2738',
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionDesc: {
    color: palette.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  inputRow: {
    marginTop: 14,
  },
  label: {
    color: palette.textSecondary,
    marginBottom: 6,
  },
  valueBox: {
    backgroundColor: '#0F141C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F2A37',
    padding: 12,
  },
  valueText: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F2A37',
  },
  chipActive: {
    borderColor: palette.accentSecondary,
    backgroundColor: '#102436',
  },
  chipText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  inputArea: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1F2A37',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#0F141C',
  },
  textAreaValue: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  versionMetrics: {
    flexDirection: 'row',
    gap: 10,
  },
  versionMetric: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  rationaleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2A37',
  },
  rationaleText: {
    color: palette.accentSecondary,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#102436',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1F2A37',
  },
  actionText: {
    color: palette.accentPrimary,
    fontWeight: '600',
  },
  abStatus: {
    marginTop: 10,
    color: palette.textSecondary,
  },
  saveButton: {
    backgroundColor: palette.accentPrimary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 12, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#101722',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2A37',
  },
  modalTitle: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalText: {
    color: palette.textSecondary,
    marginBottom: 20,
  },
  modalClose: {
    alignSelf: 'flex-end',
  },
  modalCloseText: {
    color: palette.accentSecondary,
    fontWeight: '600',
  },
});

export default EvolutionPanel;
