import React, { ReactNode } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { palette } from '../theme/colors';

interface DrawerProps {
  visible: boolean;
  width?: number;
  children: ReactNode;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const Drawer: React.FC<DrawerProps> = ({
  visible,
  width = SCREEN_WIDTH * 0.8,
  children,
}) => {
  const translateX = React.useRef(new Animated.Value(width)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: visible ? 0 : width,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [translateX, visible, width]);

  return (
    <Animated.View
      style={[
        styles.drawer,
        {
          transform: [{ translateX }],
          width,
        },
      ]}
      accessibilityViewIsModal={visible}
      accessibilityLabel="Micro agent panel"
    >
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#0E141D',
    borderLeftWidth: 1,
    borderColor: '#1F2A37',
    zIndex: 20,
    shadowColor: palette.accentGlow,
    shadowOpacity: 0.35,
    shadowOffset: { width: -8, height: 0 },
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default Drawer;
