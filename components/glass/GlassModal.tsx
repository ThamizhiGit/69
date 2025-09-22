import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GlassContainer } from './GlassContainer';
import { glassTheme } from '../../constants/theme';
import { animationConfig } from '../../constants/animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GlassModalProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  width?: number | string;
  height?: number | string;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  animationType?: 'fade' | 'scale' | 'slide';
  closeOnBackdropPress?: boolean;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  children,
  visible,
  onClose,
  width = SCREEN_WIDTH * 0.9,
  height = 'auto',
  intensity = 25,
  tint = 'light',
  animationType = 'scale',
  closeOnBackdropPress = true,
}) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: animationConfig.durations.normal });
      
      switch (animationType) {
        case 'scale':
          scale.value = withSpring(1, animationConfig.spring.gentle);
          break;
        case 'slide':
          translateY.value = withSpring(0, animationConfig.spring.gentle);
          break;
        case 'fade':
        default:
          scale.value = withTiming(1, { duration: animationConfig.durations.normal });
          break;
      }
    } else {
      opacity.value = withTiming(0, { duration: animationConfig.durations.fast });
      
      switch (animationType) {
        case 'scale':
          scale.value = withSpring(0.8, animationConfig.spring.snappy);
          break;
        case 'slide':
          translateY.value = withSpring(50, animationConfig.spring.snappy);
          break;
        case 'fade':
        default:
          scale.value = withTiming(0.9, { duration: animationConfig.durations.fast });
          break;
      }
    }
  }, [visible, animationType]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => {
    const baseStyle = {
      opacity: opacity.value,
    };

    switch (animationType) {
      case 'scale':
        return {
          ...baseStyle,
          transform: [{ scale: scale.value }],
        };
      case 'slide':
        return {
          ...baseStyle,
          transform: [{ translateY: translateY.value }],
        };
      case 'fade':
      default:
        return {
          ...baseStyle,
          transform: [{ scale: scale.value }],
        };
    }
  });

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
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

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modal,
              {
                width: typeof width === 'string' ? width : width,
                height: typeof height === 'string' ? height : height,
              },
              modalAnimatedStyle,
            ]}
          >
            <GlassContainer
              intensity={intensity}
              tint={tint}
              borderRadius={glassTheme.borderRadius.xl}
              style={styles.glassContainer}
            >
              <View style={styles.content}>
                {children}
              </View>
            </GlassContainer>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: glassTheme.spacing.lg,
  },
  modal: {
    maxWidth: SCREEN_WIDTH * 0.95,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  glassContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: glassTheme.spacing.lg,
  },
});