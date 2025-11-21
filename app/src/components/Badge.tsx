import React from 'react';
import { Text, View, StyleSheet, ViewProps } from 'react-native';
import { palette } from '../theme/colors';

interface BadgeProps extends ViewProps {
  label: string;
  tone?: 'primary' | 'success' | 'warning';
}

const toneMap = {
  primary: {
    backgroundColor: '#102436',
    borderColor: palette.accentPrimary,
    color: palette.accentSecondary,
  },
  success: {
    backgroundColor: '#0F2C1B',
    borderColor: palette.success,
    color: palette.success,
  },
  warning: {
    backgroundColor: '#2A1E0F',
    borderColor: palette.warning,
    color: palette.warning,
  },
};

const Badge: React.FC<BadgeProps> = ({ label, tone = 'primary', style, ...rest }) => {
  const toneStyles = toneMap[tone];
  return (
    <View style={[styles.badge, toneStyles, style]} accessibilityRole="text" {...rest}>
      <Text style={[styles.text, { color: toneStyles.color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

export default React.memo(Badge);
