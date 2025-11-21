import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { palette } from '../theme/colors';

interface ToolbarButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  label,
  onPress,
  icon,
  accessibilityLabel,
  active,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, active && styles.active]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={`Tap to ${label.toLowerCase()}`}
      accessibilityState={{ selected: active }}
    >
      {icon}
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#101720',
    borderWidth: 1,
    borderColor: '#1F2A37',
    marginRight: 12,
    gap: 8,
  },
  active: {
    backgroundColor: palette.accentPrimary,
    borderColor: palette.accentPrimary,
  },
  text: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeText: {
    color: '#0B0F14',
  },
});

export default ToolbarButton;
