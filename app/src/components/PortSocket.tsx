import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { palette } from '../theme/colors';

interface PortSocketProps {
  label?: string;
  direction: 'in' | 'out';
  active?: boolean;
  onPress?: () => void;
}

const PortSocket: React.FC<PortSocketProps> = ({
  label,
  direction,
  active = false,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${direction === 'in' ? 'Input' : 'Output'} port ${label ?? ''}`}
      style={[
        styles.socket,
        direction === 'in' ? styles.socketIn : styles.socketOut,
        active ? styles.socketActive : undefined,
      ]}
    >
      <Text style={styles.text}>{direction === 'in' ? '◉' : '◎'}</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  socket: {
    minWidth: 48,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 6,
  },
  socketIn: {
    backgroundColor: '#101924',
  },
  socketOut: {
    backgroundColor: '#172231',
  },
  socketActive: {
    borderWidth: 1,
    borderColor: palette.accentSecondary,
    shadowColor: palette.accentGlow,
    shadowOpacity: 0.7,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    color: palette.accentPrimary,
    fontSize: 16,
  },
  label: {
    color: palette.textSecondary,
    fontSize: 12,
  },
});

export default React.memo(PortSocket);
