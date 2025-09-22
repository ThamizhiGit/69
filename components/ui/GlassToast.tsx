import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GlassContainer } from '../glass/GlassContainer';
import { useGlassTheme } from '../../contexts/GlassThemeContext';
import { animationConfig } from '../../constants/animations';
import { hapticFeedback } from '../../utils/hapticFeedback';

const { width: screenWidth } = Dimensions.get('window');

interface GlassToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide?: () => void;
  visible: boolean;
}

export const GlassToast: React.FC<GlassToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  visible,
}) => {
  const { colors, spacing, typography, borderRadius } = useGlassTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const hideToast = () => {
    translateY.value = withTiming(-100, {
      duration: animationConfig.durations.normal,
    });
    opacity.value = withTiming(0, {
      duration: animationConfig.durations.normal,
    }, () => {
      if (onHide) {
        runOnJS(onHide)();
      }
    });
  };

  useEffect(() => {
    if (visible) {
      // Show toast with haptic feedback
      switch (type) {
        case 'success':
          hapticFeedback.orderConfirmed();
          break;
        case 'error':
          hapticFeedback.errorOccurred();
          break;
        case 'warning':
          hapticFeedback.removeFromCart();
          break;
        default:
          hapticFeedback.buttonPress();
      }

      translateY.value = withSpring(spacing.lg, animationConfig.spring.gentle);
      opacity.value = withTiming(1, {
        duration: animationConfig.durations.normal,
      });

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, type, duration]);

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return {
          background: ['rgba(72, 187, 120, 0.2)', 'rgba(72, 187, 120, 0.05)'],
          border: 'rgba(72, 187, 120, 0.3)',
          text: colors.success,
        };
      case 'error':
        return {
          background: ['rgba(252, 129, 129, 0.2)', 'rgba(252, 129, 129, 0.05)'],
          border: 'rgba(252, 129, 129, 0.3)',
          text: colors.error,
        };
      case 'warning':
        return {
          background: ['rgba(246, 173, 85, 0.2)', 'rgba(246, 173, 85, 0.05)'],
          border: 'rgba(246, 173, 85, 0.3)',
          text: colors.warning,
        };
      default:
        return {
          background: colors.background.light,
          border: colors.border.light,
          text: colors.text.primary,
        };
    }
  };

  const toastColors = getToastColors();

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GlassContainer
        intensity={25}
        tint="light"
        borderRadius={borderRadius.lg}
        style={[
          styles.toast,
          {
            borderColor: toastColors.border,
          }
        ]}
      >
        <Text style={[
          styles.message,
          {
            color: toastColors.text,
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.medium,
          }
        ]}>
          {message}
        </Text>
      </GlassContainer>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    maxWidth: screenWidth - 32,
    minWidth: 200,
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

// Toast manager for global toast notifications
class ToastManager {
  private static instance: ToastManager;
  private toastRef: React.RefObject<any> | null = null;

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  setToastRef(ref: React.RefObject<any>) {
    this.toastRef = ref;
  }

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) {
    if (this.toastRef?.current) {
      this.toastRef.current.show(message, type, duration);
    }
  }

  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 3000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 3000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }
}

export const toast = ToastManager.getInstance();