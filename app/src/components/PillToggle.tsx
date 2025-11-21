import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/colors';

interface PillToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
}

const PillToggle: React.FC<PillToggleProps> = ({
  label,
  value,
  onValueChange,
  accessibilityLabel,
}) => {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.container, value ? styles.containerActive : undefined]}
    >
      <View style={[styles.knob, value ? styles.knobActive : undefined]} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10151D',
    padding: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F2A37',
    minWidth: 160,
  },
  containerActive: {
    borderColor: palette.accentPrimary,
    backgroundColor: '#0E1C28',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F2A37',
    marginRight: 12,
  },
  knobActive: {
    backgroundColor: palette.accentPrimary,
    shadowColor: palette.accentGlow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  label: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PillToggle;
