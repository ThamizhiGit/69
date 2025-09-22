import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GlassContainer } from './GlassContainer';
import { glassTheme } from '../../constants/theme';
import { animationConfig } from '../../constants/animations';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GlassBottomSheetProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  height?: number;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export const GlassBottomSheet: React.FC<GlassBottomSheetProps> = ({
  children,
  visible,
  onClose,
  height = SCREEN_HEIGHT * 0.6,
  intensity = 25,
  tint = 'light',
}) => {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: animationConfig.durations.normal });
      translateY.value = withSpring(0, animationConfig.spring.gentle);
    } else {
      opacity.value = withTiming(0, { duration: animationConfig.durations.fast });
      translateY.value = withSpring(height, {
        ...animationConfig.spring.snappy,
        damping: 20,
      });
    }
  }, [visible, height]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleBackdropPress = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.sheet, { height }, sheetAnimatedStyle]}>
          <GlassContainer
            intensity={intensity}
            tint={tint}
            borderRadius={glassTheme.borderRadius.xl}
            style={styles.glassContainer}
          >
            {/* Handle */}
            <View style={styles.handle} />
            
            {/* Content */}
            <View style={styles.content}>
              {children}
            </View>
          </GlassContainer>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: glassTheme.borderRadius.xl,
    borderTopRightRadius: glassTheme.borderRadius.xl,
    overflow: 'hidden',
  },
  glassContainer: {
    flex: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: glassTheme.colors.text.muted,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: glassTheme.spacing.sm,
    marginBottom: glassTheme.spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: glassTheme.spacing.lg,
    paddingBottom: glassTheme.spacing.xl,
  },
});