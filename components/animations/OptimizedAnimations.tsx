import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { 
  DeviceCapabilityDetector, 
  PerformanceOptimizer,
  AnimationRegistry 
} from '../../services/performanceService';
import { animationConfig } from '../../constants/animations';

interface OptimizedAnimationProps {
  children: React.ReactNode;
  style?: ViewStyle;
  duration?: number;
  delay?: number;
  skipOnLowEnd?: boolean;
}

// Performance-optimized fade animation
export const OptimizedFadeInView: React.FC<OptimizedAnimationProps & {
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}> = ({
  children,
  style,
  duration = animationConfig.durations.normal,
  delay = 0,
  direction = 'up',
  distance = 30,
  skipOnLowEnd = true,
}) => {
  const capabilities = DeviceCapabilityDetector.getCapabilities();
  const animationId = React.useRef(`fade_${Date.now()}_${Math.random()}`);
  
  // Skip animation on low-end devices if requested
  if (skipOnLowEnd && capabilities.isLowEnd) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  useEffect(() => {
    // Check if we should skip animation due to performance
    if (PerformanceOptimizer.shouldSkipAnimation()) {
      opacity.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      return;
    }

    const optimizedConfig = PerformanceOptimizer.getOptimizedAnimationConfig({
      duration: duration,
    });

    // Register animation
    AnimationRegistry.register(animationId.current, 'fade', opacity);

    const animate = () => {
      opacity.value = withTiming(1, optimizedConfig);
      translateX.value = withTiming(0, optimizedConfig);
      translateY.value = withTiming(0, optimizedConfig);
    };

    if (delay > 0) {
      opacity.value = withDelay(delay, withTiming(1, optimizedConfig));
      translateX.value = withDelay(delay, withTiming(0, optimizedConfig));
      translateY.value = withDelay(delay, withTiming(0, optimizedConfig));
    } else {
      animate();
    }

    return () => {
      AnimationRegistry.unregister(animationId.current);
    };
  }, [duration, delay, distance]);

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

// Performance-optimized scale button
export const OptimizedScaleButton: React.FC<OptimizedAnimationProps & {
  onPress: () => void;
  disabled?: boolean;
  scaleValue?: number;
  hapticFeedback?: boolean;
}> = ({
  children,
  onPress,
  disabled = false,
  style,
  scaleValue = animationConfig.transforms.scale.pressed,
  hapticFeedback = true,
  skipOnLowEnd = true,
}) => {
  const capabilities = DeviceCapabilityDetector.getCapabilities();
  const animationId = React.useRef(`scale_${Date.now()}_${Math.random()}`);
  
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    AnimationRegistry.register(animationId.current, 'scale', scale);
    
    return () => {
      AnimationRegistry.unregister(animationId.current);
    };
  }, []);

  const handlePressIn = () => {
    if (disabled) return;
    
    // Skip animation on low-end devices if requested
    if (skipOnLowEnd && capabilities.isLowEnd) {
      return;
    }

    // Check performance constraints
    if (PerformanceOptimizer.shouldSkipAnimation()) {
      return;
    }

    const optimizedConfig = PerformanceOptimizer.getOptimizedAnimationConfig(
      animationConfig.spring.snappy
    );

    scale.value = withSpring(scaleValue, optimizedConfig);
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    if (skipOnLowEnd && capabilities.isLowEnd) {
      return;
    }

    if (PerformanceOptimizer.shouldSkipAnimation()) {
      return;
    }

    const optimizedConfig = PerformanceOptimizer.getOptimizedAnimationConfig(
      animationConfig.spring.gentle
    );

    scale.value = withSpring(1, optimizedConfig);
  };

  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Animated.View
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
      >
        <Animated.View onPress={handlePress}>
          {children}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

// Conditional animation wrapper
export const ConditionalAnimation: React.FC<{
  children: React.ReactNode;
  condition?: boolean;
  fallback?: React.ReactNode;
  animationType?: 'fade' | 'scale' | 'slide';
  animationProps?: any;
}> = ({
  children,
  condition = true,
  fallback,
  animationType = 'fade',
  animationProps = {},
}) => {
  const capabilities = DeviceCapabilityDetector.getCapabilities();
  
  // Don't animate on low-end devices or when condition is false
  if (!condition || capabilities.isLowEnd) {
    return <>{fallback || children}</>;
  }

  switch (animationType) {
    case 'fade':
      return (
        <OptimizedFadeInView {...animationProps}>
          {children}
        </OptimizedFadeInView>
      );
    case 'scale':
      return (
        <OptimizedScaleButton {...animationProps}>
          {children}
        </OptimizedScaleButton>
      );
    default:
      return <>{children}</>;
  }
};

// Performance-aware staggered animations
export const OptimizedStaggeredView: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
  maxItems?: number;
  animationProps?: any;
}> = ({
  children,
  staggerDelay = 100,
  maxItems = 10,
  animationProps = {},
}) => {
  const capabilities = DeviceCapabilityDetector.getCapabilities();
  
  // Limit animations on low-end devices
  const effectiveMaxItems = capabilities.isLowEnd ? 3 : maxItems;
  const effectiveStaggerDelay = capabilities.isLowEnd ? staggerDelay * 0.5 : staggerDelay;

  return (
    <>
      {React.Children.map(children, (child, index) => {
        // Skip animation for items beyond the limit
        if (index >= effectiveMaxItems) {
          return child;
        }

        return (
          <OptimizedFadeInView
            key={index}
            delay={index * effectiveStaggerDelay}
            {...animationProps}
          >
            {child}
          </OptimizedFadeInView>
        );
      })}
    </>
  );
};

// Memory-efficient loading skeleton
export const OptimizedLoadingSkeleton: React.FC<{
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const capabilities = DeviceCapabilityDetector.getCapabilities();
  const animationId = React.useRef(`skeleton_${Date.now()}_${Math.random()}`);
  
  // Use static skeleton on low-end devices
  if (capabilities.isLowEnd) {
    return (
      <Animated.View
        style={[
          {
            width,
            height,
            borderRadius,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          style,
        ]}
      />
    );
  }

  const opacity = useSharedValue(0.3);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    AnimationRegistry.register(animationId.current, 'skeleton', opacity);

    // Simple opacity animation instead of complex shimmer
    const animate = () => {
      opacity.value = withTiming(0.7, { duration: 1000 }, () => {
        opacity.value = withTiming(0.3, { duration: 1000 }, () => {
          runOnJS(animate)();
        });
      });
    };

    animate();

    return () => {
      AnimationRegistry.unregister(animationId.current);
    };
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        style,
        animatedStyle,
      ]}
    />
  );
};