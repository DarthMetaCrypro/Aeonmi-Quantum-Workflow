import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ShieldIcon from './ShieldIcon';
import { palette } from '../theme/colors';

const QuantumBadge = () => {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel="Quantum secured workflow"
    >
      <ShieldIcon size={16} color={palette.accentSecondary} />
      <Text style={styles.text}>Quantum Secured</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#102436',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.accentSecondary,
    gap: 6,
  },
  text: {
    color: palette.accentSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default React.memo(QuantumBadge);
