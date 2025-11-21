import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import Drawer from './Drawer';
import KeyValueEditor, { KeyValueField } from './KeyValueEditor';
import { Node, MicroAIConfig } from '../types/workflow';
import { palette } from '../theme/colors';

interface MicroAgentPanelProps {
  node?: Node;
  visible: boolean;
  onClose: () => void;
  onSaveConfig: (
    nodeId: string,
    config: Record<string, unknown>,
    microAIConfig?: MicroAIConfig,
  ) => void;
  templates: Record<string, string>;
}

type PanelTab = 'config' | 'scripts' | 'telemetry' | 'ai';

type PanelFormValues = {
  config: KeyValueField[];
  scripts: {
    pre: string;
    post: string;
    guard: string;
  };
  microAIConfig: MicroAIConfig;
};

type ScriptField = keyof PanelFormValues['scripts'];

const MicroAgentPanel: React.FC<MicroAgentPanelProps> = ({
  node,
  visible,
  onClose,
  onSaveConfig,
  templates,
}) => {
  const methods = useForm<PanelFormValues>({
    mode: 'onBlur',
    defaultValues: {
      config: [],
      scripts: {
        pre: '',
        post: '',
        guard: '',
      },
      microAIConfig: {
        model: 'gpt-4',
        temperature: 0.7,
        systemPrompt: '',
        capabilities: [],
        costLimitUsd: 1.0,
      },
    },
  });
  const { reset, handleSubmit, watch, control } = methods;
  const [activeTab, setActiveTab] = React.useState<PanelTab>('config');

  React.useEffect(() => {
    if (node) {
      const scriptConfig = (
        node.config as { scripts?: PanelFormValues['scripts'] } | undefined
      )?.scripts;
      const configPairs: KeyValueField[] = Object.entries(node.config ?? {}).map(
        ([key, value]) => ({ key, value: String(value) }),
      );
      reset({
        config: configPairs,
        scripts: {
          pre: scriptConfig?.pre ?? '',
          post: scriptConfig?.post ?? '',
          guard: scriptConfig?.guard ?? '',
        },
        microAIConfig: node.microAIConfig ?? {
          model: 'gpt-4',
          temperature: 0.7,
          systemPrompt: '',
          capabilities: [],
          costLimitUsd: 1.0,
        },
      });
    }
  }, [node, reset]);

  const onSubmit = (values: PanelFormValues) => {
    if (!node) {
      return;
    }
    const config = values.config.reduce<Record<string, string>>((acc, item) => {
      if (item.key) {
        acc[item.key] = item.value;
      }
      return acc;
    }, {});
    onSaveConfig(
      node.id,
      {
        ...config,
        scripts: values.scripts,
      },
      values.microAIConfig,
    );
    onClose();
  };

  const scripts = watch('scripts') as PanelFormValues['scripts'];
  const applyTemplate = (field: ScriptField, templateKey: string) => {
    const template = templates[templateKey];
    if (!template) {
      return;
    }
    methods.setValue(`scripts.${field}`, template);
  };

  return (
    <Drawer visible={visible}>
      {node ? (
        <FormProvider {...methods}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{node.title}</Text>
              <Pressable onPress={handleSubmit(onSubmit)} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
            <View style={styles.tabRow}>
              {(
                [
                  { key: 'config', label: 'Config' },
                  { key: 'scripts', label: 'Scripts' },
                  { key: 'telemetry', label: 'Telemetry' },
                  { key: 'ai', label: 'AI Config' },
                ] as const
              ).map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[
                    styles.tabButton,
                    activeTab === tab.key ? styles.tabButtonActive : undefined,
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === tab.key }}
                >
                  <Text style={styles.tabText}>{tab.label}</Text>
                </Pressable>
              ))}
            </View>
            {activeTab === 'config' ? <KeyValueEditor name="config" /> : null}
            {activeTab === 'scripts' ? (
              <View style={styles.scriptsSection}>
                {(['pre', 'post', 'guard'] as readonly ScriptField[]).map((field) => (
                  <View key={field} style={styles.scriptBlock}>
                    <View style={styles.scriptHeader}>
                      <Text style={styles.scriptLabel}>{field.toUpperCase()} Script</Text>
                      <Pressable
                        onPress={() => applyTemplate(field, `${field}processing`)}
                        style={styles.templateButton}
                      >
                        <Text style={styles.templateText}>Insert Template</Text>
                      </Pressable>
                    </View>
                    <TextInput
                      multiline
                      numberOfLines={6}
                      style={styles.scriptInput}
                      value={scripts?.[field] ?? ''}
                      onChangeText={(text: string) =>
                        methods.setValue(`scripts.${field}`, text)
                      }
                      placeholder={`Enter ${field} script`}
                      placeholderTextColor="#475569"
                    />
                  </View>
                ))}
              </View>
            ) : null}
            {activeTab === 'telemetry' ? (
              <View style={styles.telemetry}>
                <Text style={styles.telemetryTitle}>Mock Telemetry</Text>
                <Text style={styles.telemetryItem}>
                  Runs: {Math.round(Math.random() * 120)}
                </Text>
                <Text style={styles.telemetryItem}>
                  Avg Latency: {180 + Math.round(Math.random() * 60)}ms
                </Text>
                <Text style={styles.telemetryItem}>
                  Error Rate: {(Math.random() * 0.05).toFixed(2)}
                </Text>
                {node.type.startsWith('QUBE_') ? (
                  <Text style={styles.telemetryItem}>
                    QBER: {(Math.random() * 0.02).toFixed(3)}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {activeTab === 'ai' ? (
              <View style={styles.aiSection}>
                <Text style={styles.sectionTitle}>Micro AI Configuration</Text>

                <Text style={styles.label}>Model</Text>
                <Controller
                  control={control}
                  name="microAIConfig.model"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.pillRow}>
                      {['gpt-4', 'claude-3', 'llama-3', 'aeonmi-micro-v1'].map((m) => (
                        <Pressable
                          key={m}
                          onPress={() => onChange(m)}
                          style={[styles.pill, value === m && styles.pillActive]}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              value === m && styles.pillTextActive,
                            ]}
                          >
                            {m}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />

                <Text style={styles.label}>
                  Temperature: {watch('microAIConfig')?.temperature ?? 0.7}
                </Text>
                <Controller
                  control={control}
                  name="microAIConfig.temperature"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(t) => onChange(parseFloat(t) || 0)}
                      placeholderTextColor="#475569"
                    />
                  )}
                />

                <Text style={styles.label}>System Prompt</Text>
                <Controller
                  control={control}
                  name="microAIConfig.systemPrompt"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      multiline
                      numberOfLines={4}
                      value={value ?? ''}
                      onChangeText={onChange}
                      placeholder="Enter system prompt..."
                      placeholderTextColor="#475569"
                    />
                  )}
                />

                <Text style={styles.label}>Cost Limit (USD)</Text>
                <Controller
                  control={control}
                  name="microAIConfig.costLimitUsd"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(t) => onChange(parseFloat(t) || 0)}
                      placeholderTextColor="#475569"
                    />
                  )}
                />
              </View>
            ) : null}
          </ScrollView>
        </FormProvider>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Select a node to configure micro agents.
          </Text>
        </View>
      )}
    </Drawer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: palette.accentPrimary,
  },
  saveText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  closeText: {
    color: palette.textSecondary,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabButtonActive: {
    backgroundColor: '#102436',
    borderColor: palette.accentSecondary,
  },
  tabText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  scriptsSection: {
    gap: 16,
  },
  scriptBlock: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#0F141C',
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scriptLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  templateButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#122132',
  },
  templateText: {
    color: palette.accentSecondary,
    fontSize: 12,
  },
  scriptInput: {
    minHeight: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2A37',
    backgroundColor: '#101721',
    color: palette.textPrimary,
    padding: 10,
    textAlignVertical: 'top',
  },
  telemetry: {
    borderWidth: 1,
    borderColor: '#1F2A37',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#0F141C',
    gap: 8,
  },
  telemetryTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  telemetryItem: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: palette.textSecondary,
    textAlign: 'center',
  },
  aiSection: {
    gap: 16,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    color: palette.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F141C',
  },
  pillActive: {
    borderColor: palette.accentPrimary,
    backgroundColor: '#102436',
  },
  pillText: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  pillTextActive: {
    color: palette.accentPrimary,
    fontWeight: '600',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2A37',
    backgroundColor: '#101721',
    color: palette.textPrimary,
    padding: 10,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default MicroAgentPanel;
