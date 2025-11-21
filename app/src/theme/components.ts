import { StyleSheet } from 'react-native';
import { palette } from './colors';

export const layoutStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  surface: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: 12,
  },
});

export const textStyles = StyleSheet.create({
  heading: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 16,
  },
  label: {
    color: palette.textSecondary,
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
