import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { animationConfig } from '../../constants/animations';

interface ScaleButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  scaleValue?: number;
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
}

export const ScaleButton: React.FC<ScaleButtonProps> = ({
  children,
  onPress,
  disabled = false,
  style,
  scaleValue = animationConfig.transforms.scale.pressed,
  hapticFeedback = true,
  rippleEffect = false,
}) => {
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    
    scale.value = withSpring(scaleValue, animationConfig.spring.snappy);
    
    if (rippleEffect) {
      rippleScale.value = 0;
      rippleOpacity.value = 0.3;
      rippleScale.value = withTiming(1, { duration: 300 });
      rippleOpacity.value = withSequence(
        withTiming(0.3, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    scale.value = withSpring(1, animationConfig.spring.gentle);
  };

  const handlePress = () => {
    if (disabled) return;
    
    // Add bounce effect
    scale.value = withSequence(
      withSpring(1.05, { ...animationConfig.spring.bouncy, duration: 100 }),
      withSpring(1, animationConfig.spring.gentle)
    );
    
    onPress();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={1}
      style={style}
    >
      <Animated.View style={animatedStyle}>
        {children}
        {rippleEffect && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 1000,
              },
              rippleAnimatedStyle,
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};