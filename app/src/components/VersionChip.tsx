import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette } from '../theme/colors';
import { WorkflowVersionStatus } from '../types';

type VersionChipProps = {
  label: string;
  status?: WorkflowVersionStatus;
};

const toneByStatus: Record<
  WorkflowVersionStatus | 'default',
  { background: string; foreground: string }
> = {
  live: { background: '#0F2C1B', foreground: palette.success },
  experimental: { background: '#2A1E0F', foreground: palette.warning },
  archived: { background: '#1F2937', foreground: palette.textSecondary },
  default: { background: '#111827', foreground: palette.textSecondary },
};

const VersionChip: React.FC<VersionChipProps> = ({ label, status }) => {
  const tone = toneByStatus[status ?? 'default'];
  return (
    <View
      style={[styles.container, { backgroundColor: tone.background }]}
      accessibilityRole="text"
      accessibilityLabel={`${status ?? 'Version'} ${label}`}
    >
      <Text style={[styles.text, { color: tone.foreground }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#24304A',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default React.memo(VersionChip);
