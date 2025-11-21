import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { palette } from '../theme/colors';

export type KeyValueField = {
  key: string;
  value: string;
  type?: 'string' | 'number' | 'boolean';
};

interface KeyValueEditorProps {
  name: string;
  presets?: KeyValueField[];
}

const KeyValueEditor: React.FC<KeyValueEditorProps> = ({ name, presets }) => {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name }) as unknown as {
    fields: Array<{ id: string } & KeyValueField>;
    append: (value: KeyValueField) => void;
    remove: (index: number) => void;
  };

  const applyPreset = (preset: KeyValueField) => {
    const existingIndex = fields.findIndex((field) => field.key === preset.key);
    if (existingIndex >= 0) {
      setValue(`${name}.${existingIndex}.value`, preset.value);
      return;
    }
    append(preset);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Configuration</Text>
        {presets?.length ? (
          <View style={styles.presetRow}>
            {presets.map((preset) => (
              <Pressable
                key={preset.key}
                style={styles.presetChip}
                onPress={() => applyPreset(preset)}
                accessibilityRole="button"
                accessibilityLabel={`Apply preset ${preset.key}`}
              >
                <Text style={styles.presetText}>{preset.key}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {fields.map((field, index) => (
        <View key={field.id} style={styles.row}>
          <Controller
            control={control}
            name={`${name}.${index}.key`}
            render={({
              field: controllerField,
            }: {
              field: { value: string; onChange: (value: string) => void };
            }) => (
              <TextInput
                style={styles.input}
                value={controllerField.value}
                onChangeText={controllerField.onChange}
                placeholder="Key"
                placeholderTextColor="#475569"
                autoCapitalize="none"
              />
            )}
          />
          <Controller
            control={control}
            name={`${name}.${index}.value`}
            render={({
              field: controllerField,
            }: {
              field: { value: string; onChange: (value: string) => void };
            }) => (
              <TextInput
                style={[styles.input, styles.valueInput]}
                value={controllerField.value}
                onChangeText={controllerField.onChange}
                placeholder="Value"
                placeholderTextColor="#475569"
                autoCapitalize="none"
              />
            )}
          />
          <Pressable
            onPress={() => remove(index)}
            style={styles.removeButton}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${field.key}`}
          >
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        style={styles.addButton}
        onPress={() => append({ key: '', value: '' })}
        accessibilityLabel="Add configuration item"
        accessibilityRole="button"
      >
        <Text style={styles.addText}>+ Add Field</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#0F141C',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#122132',
  },
  presetText: {
    color: palette.accentSecondary,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#101721',
    color: palette.textPrimary,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F2A37',
    marginRight: 8,
  },
  valueInput: {
    flex: 1.2,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeText: {
    color: palette.danger,
    fontSize: 20,
  },
  addButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#122132',
  },
  addText: {
    color: palette.accentPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default KeyValueEditor;
