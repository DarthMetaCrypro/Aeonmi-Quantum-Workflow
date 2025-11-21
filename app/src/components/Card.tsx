import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { palette } from '../theme/colors';

interface CardProps extends ViewProps {
  children: ReactNode;
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({ children, elevated = false, style, ...rest }) => {
  return (
    <View
      style={[styles.card, elevated ? styles.cardElevated : undefined, style]}
      accessibilityRole="summary"
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardElevated: {
    shadowColor: palette.accentGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default React.memo(Card);
