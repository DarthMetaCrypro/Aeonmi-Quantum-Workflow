import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { palette } from '../theme/colors';

interface FabProps {
  label: string;
  onPress: () => void;
}

const Fab: React.FC<FabProps> = ({ label, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={styles.fab}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`Tap to ${label.toLowerCase()}`}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: palette.accentPrimary,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: palette.accentGlow,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  text: {
    color: '#0B0F14',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default Fab;
