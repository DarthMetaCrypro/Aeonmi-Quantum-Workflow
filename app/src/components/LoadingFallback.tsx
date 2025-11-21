import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { palette } from '../theme/colors';

/**
 * Loading fallback component for React.lazy() Suspense boundaries
 * Displays centered spinner during code-split chunk loading
 */
export const LoadingFallback: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={palette.accentPrimary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
});
