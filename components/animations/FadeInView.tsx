import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { animationConfig } from '../../constants/animations';

interface FadeInViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  duration?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  springAnimation?: boolean;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  style,
  duration = animationConfig.durations.normal,
  delay = 0,
  direction = 'up',
  distance = 30,
  springAnimation = false,
  staggerChildren = false,
  staggerDelay = 100,
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  const scale = useSharedValue(0.95);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  useEffect(() => {
    const animateIn = () => {
      if (springAnimation) {
        opacity.value = withSpring(1, animationConfig.spring.gentle);
        translateX.value = withSpring(0, animationConfig.spring.gentle);
        translateY.value = withSpring(0, animationConfig.spring.gentle);
        scale.value = withSpring(1, animationConfig.spring.gentle);
      } else {
        opacity.value = withTiming(1, { duration });
        translateX.value = withTiming(0, { duration });
        translateY.value = withTiming(0, { duration });
        scale.value = withTiming(1, { duration });
      }
    };

    if (delay > 0) {
      opacity.value = withDelay(delay, withTiming(1, { duration }));
      translateX.value = withDelay(delay, withTiming(0, { duration }));
      translateY.value = withDelay(delay, withTiming(0, { duration }));
      scale.value = withDelay(delay, withTiming(1, { duration }));
    } else {
      animateIn();
    }
  }, [duration, delay, distance, springAnimation]);

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

// Staggered fade in for multiple children
export const StaggeredFadeInView: React.FC<{
  children: React.ReactNode[];
  style?: ViewStyle;
  staggerDelay?: number;
  childProps?: Omit<FadeInViewProps, 'children'>;
}> = ({
  children,
  style,
  staggerDelay = 100,
  childProps = {},
}) => {
  return (
    <Animated.View style={style}>
      {React.Children.map(children, (child, index) => (
        <FadeInView
          key={index}
          delay={index * staggerDelay}
          {...childProps}
        >
          {child}
        </FadeInView>
      ))}
    </Animated.View>
  );
};