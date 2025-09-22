import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { GlassContainer } from './GlassContainer';
import { glassTheme } from '../../constants/theme';
import { standardGlassStyles, glassConfigs } from '../../constants/glassStyles';
import { hapticFeedback } from '../../utils/hapticFeedback';
import { animationConfig } from '../../constants/animations';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  intensity = 15,
  tint = 'light',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      hapticFeedback.buttonPress();
      scale.value = withSpring(animationConfig.transforms.scale.pressed, animationConfig.spring.snappy);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, animationConfig.spring.gentle);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };
  const getButtonStyles = () => {
    const baseStyle = [styles.button];
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'large':
        baseStyle.push(styles.largeButton);
        break;
      case 'medium':
      default:
        baseStyle.push(styles.mediumButton);
        break;
    }

    // Full width
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    // Disabled state
    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    return baseStyle;
  };

  const getTextStyles = () => {
    const baseStyle = [styles.text];
    
    // Variant text styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'outline':
        baseStyle.push(styles.outlineText);
        break;
    }

    // Size text styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
      case 'medium':
      default:
        baseStyle.push(styles.mediumText);
        break;
    }

    // Disabled text
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return baseStyle;
  };

  const getGlassTint = () => {
    if (variant === 'primary') {
      return 'primary';
    }
    return tint;
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={[getButtonStyles(), style, animatedStyle]}
    >
      <GlassContainer
        intensity={intensity}
        tint={getGlassTint()}
        borderRadius={glassTheme.borderRadius.lg}
        borderWidth={variant === 'outline' ? 2 : 1}
        style={styles.glassContainer}
      >
        <Text style={[getTextStyles(), textStyle]}>
          {title}
        </Text>
      </GlassContainer>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    ...glassTheme.shadows.button,
  },
  glassContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Size styles
  smallButton: {
    minHeight: 36,
    paddingHorizontal: glassTheme.spacing.md,
  },
  mediumButton: {
    minHeight: 44,
    paddingHorizontal: glassTheme.spacing.lg,
  },
  largeButton: {
    minHeight: 52,
    paddingHorizontal: glassTheme.spacing.xl,
  },

  // Text styles
  text: {
    fontWeight: glassTheme.typography.weights.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: glassTheme.colors.text.light,
  },
  secondaryText: {
    color: glassTheme.colors.text.primary,
  },
  outlineText: {
    color: glassTheme.colors.primary,
  },
  disabledText: {
    color: glassTheme.colors.text.muted,
  },

  // Size text styles
  smallText: {
    fontSize: glassTheme.typography.sizes.sm,
  },
  mediumText: {
    fontSize: glassTheme.typography.sizes.md,
  },
  largeText: {
    fontSize: glassTheme.typography.sizes.lg,
  },
});